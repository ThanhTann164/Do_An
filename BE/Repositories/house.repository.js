const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require("../models/init-models");
const {
  houses,
  houseimages,
  comments,
  ratings,
  houseviewings,
  requests,
  transactions,
  ownershipdocuments,
  iotdevices,
  iotcontrollogs,
  iotresponselogs,
  contracts,
  contractsignatures,
  users,
  userpackages,
  packages,
} = initModels(sequelize);
const { Op } = require("sequelize");

const DriveUtil = require("../utils/drive");
const MAIN_FOLDER_ID = process.env.DRIVE_FOLDER_ID_IMAGEHOME;


class HouseRepository {
  // Tạo nhà mới kèm ảnh
  async create(data) {
    console.log('🔍 Repository create - data received:', Object.keys(data));
    console.log('🔍 Repository create - OwnerID:', data.OwnerID);
    return sequelize.transaction(async (t) => {
      const { images, ...houseData } = data;
      console.log('🔍 Repository create - houseData after destructure:', Object.keys(houseData));
      console.log('🔍 Repository create - houseData.OwnerID:', houseData.OwnerID);
      console.log('🔍 Repository create - Full houseData:', JSON.stringify(houseData, null, 2));
      
      let house;
      try {
        house = await houses.create(houseData, { transaction: t });
        console.log('✅ House created successfully:', house.HouseID);
      } catch (error) {
        console.error('❌ Error creating house:', error.message);
        console.error('❌ SQL Error:', error.sql);
        console.error('❌ Error details:', error);
        throw error;
      }

      // Tạo folder Drive cho nhà
      const folderId = await DriveUtil.createFolder(house.HouseID, MAIN_FOLDER_ID);
      await house.update({ DriveFolderID: folderId }, { transaction: t });
      
      // Upload ảnh
      if (images && images.length) {
        for (const img of images) {
          const fileName = `House-${house.HouseID}-${Date.now()}-${img.originalname}`;
          const file = await DriveUtil.uploadFileBuffer(img.buffer, fileName, folderId, img.mimetype);

          await houseimages.create({
            HouseID: house.HouseID,
            FileName: fileName,
            CloudPath: file.webViewLink,
            DriveFileID: file.id,
            IsCover: img.isCover || false,
          }, { transaction: t });
        }
      }

      return house;
    });
  }
// Lấy tất cả nhà với phân trang - SORT BY TIER & BOOST
  async findAllWithPagination(offset = 0, limit = 10) {
    try {
      // Get all houses first (no pagination yet) to sort properly
      const allHouses = await houses.findAll({
        where: { Status: "Available" },
        include: [
          { 
            model: houseimages, 
            as: "houseimages",
            attributes: ['ImageID', 'HouseID', 'FileName', 'CloudPath', 'DriveFileID', 'IsCover']
          },
          {
            model: users,
            as: "Owner",
            attributes: ['UserID', 'FullName', 'Email'],
            required: false,
            include: [{
              model: userpackages,
              as: "userpackages",
              where: {
                status: 'active',
                end_at: { [Op.gt]: new Date() }
              },
              required: false,
              include: [{
                model: packages,
                as: "Package",
                attributes: ['id', 'name', 'display_name'],
                required: false
              }]
            }]
          }
        ],
        raw: false,
        nest: true
      });

      // Helper function to get package priority
      const getPackagePriority = (packageName) => {
        if (!packageName) return 1; // FREE
        const name = packageName.toUpperCase();
        if (name === 'PREMIUM') return 3;
        if (name === 'PRO') return 2;
        return 1; // FREE
      };

      // Sort by: Boost > Tier Level > Created At
      const sortedHouses = allHouses
        .map(house => {
          // Get package info safely
          const owner = house.dataValues?.Owner || house.Owner;
          const userpackages = owner?.userpackages || owner?.dataValues?.userpackages || [];
          const activePackage = Array.isArray(userpackages) && userpackages.length > 0 
            ? userpackages[0]?.Package || userpackages[0]?.dataValues?.Package
            : null;
          const packageName = activePackage?.name?.toUpperCase() || activePackage?.dataValues?.name?.toUpperCase() || 'FREE';
          const packagePriority = getPackagePriority(packageName);
          
          // Check if boosted - handle both Sequelize instance and plain object
          const isBoostedValue = house.dataValues?.IsBoosted ?? house.IsBoosted ?? false;
          const boostExpiresAt = house.dataValues?.BoostExpiresAt ?? house.BoostExpiresAt;
          const isBoosted = isBoostedValue && 
                           boostExpiresAt && 
                           new Date(boostExpiresAt) > new Date();
          
          // Get tierLevel from database or calculate from package
          const tierLevelValue = house.dataValues?.TierLevel ?? house.TierLevel;
          const tierLevel = tierLevelValue || packagePriority;
          
          // Get createdAt
          const createdAt = house.dataValues?.createdAt ?? house.createdAt ?? new Date();

          return {
            house: house,
            _sortBoost: isBoosted ? 0 : 1, // 0 = boosted (first)
            _sortTier: tierLevel, // 3 = Premium, 2 = Pro, 1 = Free
            _createdAt: createdAt
          };
        })
        .sort((a, b) => {
          // 1st: Boost (boosted first)
          if (a._sortBoost !== b._sortBoost) {
            return a._sortBoost - b._sortBoost;
          }
          // 2nd: Tier Level (Premium > Pro > Free)
          if (a._sortTier !== b._sortTier) {
            return b._sortTier - a._sortTier; // Higher tier first
          }
          // 3rd: Created At (newest first)
          return new Date(b._createdAt) - new Date(a._createdAt);
        })
        .map(item => item.house); // Return original house objects

      // Apply pagination after sorting
      const total = sortedHouses.length;
      const paginatedHouses = sortedHouses.slice(offset, offset + limit);

      console.log(`🔍 Repository: findAllWithPagination - Found ${total} houses, returning ${paginatedHouses.length} for page ${Math.floor(offset / limit) + 1}`);

      return {
        data: paginatedHouses,
        total: total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('❌ Error in findAllWithPagination:', error);
      throw error;
    }
  }

  // Lấy nhà theo owner với phân trang
  async findByOwnerWithPagination(ownerId, offset = 0, limit = 10) {
    try {
      const result = await houses.findAndCountAll({
        where: { 
          OwnerID: ownerId, 
          Status: "Available" 
        },
        include: [
          { 
            model: houseimages, 
            as: "houseimages",
            attributes: ['ImageID', 'HouseID', 'FileName', 'CloudPath', 'DriveFileID', 'IsCover']
          }
        ],
        order: [["CreatedAt", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
        raw: false
      });

      console.log(`🔍 Repository: findByOwnerWithPagination - Found ${result.count} houses for owner ${ownerId}, returning ${result.rows.length}`);

      return {
        data: result.rows,
        total: result.count,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(result.count / limit)
      };
    } catch (error) {
      console.error('❌ Error in findByOwnerWithPagination:', error);
      throw error;
    }
  }

  // Lấy nhà theo buyer (từ transactions) với phân trang
  async findByBuyerWithPagination(buyerId, offset = 0, limit = 10) {
    try {
      // Lấy các transaction của buyer (chỉ lấy transaction đang xử lý hoặc đã hoàn thành)
      const buyerTransactions = await transactions.findAll({
        where: { 
          BuyerID: buyerId,
          Status: { [Op.in]: ['Pending', 'Completed'] }
        },
        attributes: ['HouseID'],
        raw: true
      });

      const houseIds = [...new Set(buyerTransactions.map(t => t.HouseID))]; // Loại bỏ duplicate
      
      if (houseIds.length === 0) {
        console.log(`🔍 Repository: findByBuyerWithPagination - No transactions found for buyer ${buyerId}`);
        return {
          data: [],
          total: 0,
          page: Math.floor(offset / limit) + 1,
          pageSize: limit,
          totalPages: 0
        };
      }

      // Lấy nhà từ danh sách HouseID với ảnh
      const result = await houses.findAndCountAll({
        where: { 
          HouseID: { [Op.in]: houseIds }
        },
        include: [
          { 
            model: houseimages, 
            as: "houseimages",
            attributes: ['ImageID', 'HouseID', 'FileName', 'CloudPath', 'DriveFileID', 'IsCover']
          }
        ],
        order: [["CreatedAt", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
        raw: false
      });

      console.log(`🔍 Repository: findByBuyerWithPagination - Found ${result.count} houses for buyer ${buyerId}, returning ${result.rows.length}`);

      return {
        data: result.rows,
        total: result.count,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(result.count / limit)
      };
    } catch (error) {
      console.error('❌ Error in findByBuyerWithPagination:', error);
      throw error;
    }
  }

  // Tìm kiếm với phân trang
  async searchWithPagination({ minPrice, maxPrice, keyword, offset = 0, limit = 10 }) {
    try {
      const whereClause = { Status: "Available" };
      
      // Xử lý điều kiện giá
      if (minPrice !== undefined && minPrice !== '') {
        whereClause.Price = { [Op.gte]: parseFloat(minPrice) };
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        whereClause.Price = { 
          ...whereClause.Price, 
          [Op.lte]: parseFloat(maxPrice) 
        };
      }
      
      // Xử lý từ khóa tìm kiếm
      if (keyword && keyword !== '') {
        whereClause[Op.or] = [
          { Address: { [Op.like]: `%${keyword}%` } },
          { City: { [Op.like]: `%${keyword}%` } },
          { District: { [Op.like]: `%${keyword}%` } },
          { Title: { [Op.like]: `%${keyword}%` } }
        ];
      }

      const result = await houses.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: houseimages, 
            as: "houseimages",
            attributes: ['ImageID', 'HouseID', 'FileName', 'CloudPath', 'DriveFileID', 'IsCover']
          }
        ],
        order: [["CreatedAt", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
        raw: false
      });

      console.log(`🔍 Repository: searchWithPagination - Found ${result.count} houses for search, returning ${result.rows.length}`);

      return {
        data: result.rows,
        total: result.count,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(result.count / limit)
      };
    } catch (error) {
      console.error('❌ Error in searchWithPagination:', error);
      throw error;
    }
  }
  // Lấy nhà theo ID, kèm ảnh và link Drive
  async findById(houseId) {
    const { users } = initModels(sequelize);
    const house = await houses.findByPk(houseId, {
      include: [
        { model: houseimages, as: "houseimages" },
        { 
          model: users, 
          as: "Owner",
          attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber', 'Role']
        }
      ],
      raw: false
    });
    if (!house) return null;

    if (house.DriveFolderID) {
      const files = await DriveUtil.listFilesInFolder(house.DriveFolderID);
      house.dataValues.driveImages = files;
    }

    return house;
  }

  // Lấy tất cả nhà
  async findAll(filter = {}) {
    return houses.findAll({
      where: filter,
      include: [{ model: houseimages, as: "houseimages" }],
      raw: false
    });
  }

  async findByOwner(ownerId) {
    return houses.findAll({
      where: { OwnerID: ownerId },
      include: [{ model: houseimages, as: "houseimages" }],
      order: [["CreatedAt", "DESC"]],
      raw: false
    });
  }

  // Cập nhật nhà và ảnh liên quan
  async update(houseId, data) {
    return sequelize.transaction(async (t) => {
      const { images, deletedImageIds, ...houseData } = data;
      const house = await houses.findByPk(houseId);
      if (!house) throw new Error("House not found");

      await house.update(houseData, { transaction: t });

      // Xóa ảnh
      if (deletedImageIds && deletedImageIds.length) {
        for (const imgId of deletedImageIds) {
          const img = await houseimages.findByPk(imgId);
          if (img) {
            await DriveUtil.deleteFile(img.DriveFileID);
            await img.destroy({ transaction: t });
          }
        }
      }

      // Upload ảnh mới
      if (images && images.length) {
        for (const img of images) {
          const fileName = `House-${house.HouseID}-${Date.now()}-${img.originalname}`;
          const file = await DriveUtil.uploadFileBuffer(img.buffer, fileName, house.DriveFolderID, img.mimetype);

          await houseimages.create({
            HouseID: house.HouseID,
            FileName: fileName,
            CloudPath: file.webViewLink,
            DriveFileID: file.id,
            IsCover: img.isCover || false,
          }, { transaction: t });
        }
      }

      return this.findById(houseId);
    });
  }

  // Xóa nhà và ảnh liên quan
  async delete(houseId) {
    return sequelize.transaction(async (t) => {
      // Sử dụng raw query để tránh lỗi với timestamps
      const house = await sequelize.query(
        'SELECT * FROM houses WHERE HouseID = ?',
        {
          replacements: [houseId],
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!house || house.length === 0) throw new Error("House not found");
      const houseData = house[0];

      // Xóa folder Drive của nhà (ảnh sẽ bị xóa theo)
      if (houseData.DriveFolderID) {
        try {
          await DriveUtil.deleteFolder(houseData.DriveFolderID);
        } catch (err) {
          console.warn('Drive folder delete warning:', err.message);
        }
      }

      // IoT devices và logs liên quan - dùng raw query
      await sequelize.query(
        'DELETE FROM iotresponselogs WHERE DeviceID IN (SELECT DeviceID FROM iotdevices WHERE HouseID = ?)',
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t }
      );
      
      await sequelize.query(
        'DELETE FROM iotcontrollogs WHERE DeviceID IN (SELECT DeviceID FROM iotdevices WHERE HouseID = ?)',
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t }
      );
      
      await sequelize.query(
        'DELETE FROM iotdevices WHERE HouseID = ?',
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t }
      );

      // Giao dịch và hợp đồng liên quan - dùng raw query
      await sequelize.query(
        'DELETE FROM contractsignatures WHERE ContractID IN (SELECT ContractID FROM contracts WHERE TransactionID IN (SELECT TransactionID FROM transactions WHERE HouseID = ?))',
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t }
      );
      
      await sequelize.query(
        'DELETE FROM contracts WHERE TransactionID IN (SELECT TransactionID FROM transactions WHERE HouseID = ?)',
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t }
      );
      
      await sequelize.query(
        'DELETE FROM transactions WHERE HouseID = ?',
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t }
      );

      // Các bảng liên quan khác - dùng raw query
      await sequelize.query('DELETE FROM requests WHERE HouseID = ?', 
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t });
      
      await sequelize.query('DELETE FROM comments WHERE HouseID = ?', 
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t });
      
      await sequelize.query('DELETE FROM ratings WHERE HouseID = ?', 
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t });
      
      await sequelize.query('DELETE FROM houseviewings WHERE HouseID = ?', 
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t });
      
      await sequelize.query('DELETE FROM ownershipdocuments WHERE HouseID = ?', 
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t });

      // Ảnh trong DB
      await sequelize.query('DELETE FROM houseimages WHERE HouseID = ?', 
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t });

      // Cuối cùng xóa bản ghi nhà
      await sequelize.query('DELETE FROM houses WHERE HouseID = ?', 
        { replacements: [houseId], type: sequelize.QueryTypes.DELETE, transaction: t });

      return true;
    });
  }

  // Tìm kiếm nhà theo khoảng giá và từ khóa địa chỉ
  async search({ minPrice, maxPrice, keyword }) {
    const whereClause = {};
    if (minPrice !== undefined && maxPrice !== undefined) {
      whereClause.Price = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice !== undefined) {
      whereClause.Price = { [Op.gte]: minPrice };
    } else if (maxPrice !== undefined) {
      whereClause.Price = { [Op.lte]: maxPrice };
    }
    if (keyword) {
      whereClause.Address = { [Op.like]: `%${keyword}%` };
    }

    return await houses.findAll({
      where: whereClause,
      include: [{ model: houseimages, as: "houseimages" }],
      raw: false
    });
  }

  async setAsCover(imageId, userId, isAdmin = false) {
    return sequelize.transaction(async (t) => {
      const img = await houseimages.findByPk(imageId);
      if (!img) throw new Error("Image not found");

      const house = await houses.findByPk(img.HouseID);
      if (!house) throw new Error("House not found");
      if (!isAdmin && house.OwnerID !== userId) {
        throw new Error("Not authorized");
      }
      await houseimages.update(
        { IsCover: false },
        { where: { HouseID: house.HouseID }, transaction: t }
      );
      img.IsCover = true;
      await img.save({ transaction: t });

      return img;
    });
  }

  // Xóa ảnh riêng lẻ
  async deleteImage(imageId, userId, isAdmin = false) {
    const img = await houseimages.findByPk(imageId);
    if (!img) throw new Error("Image not found");

    const house = await houses.findByPk(img.HouseID);
    if (!house) throw new Error("House not found");

    if (!isAdmin && house.OwnerID !== userId) {
      throw new Error("Not authorized");
    }

    await DriveUtil.deleteFile(img.DriveFileID);
    await img.destroy();

    return true;
  }
}

module.exports = new HouseRepository();