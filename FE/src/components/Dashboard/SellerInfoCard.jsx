import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const SellerInfoCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-[#00A884] to-[#00b894] rounded-full flex items-center justify-center">
          {user.avatarUrl || user.AvatarUrl ? (
            <img 
              src={user.avatarUrl || user.AvatarUrl} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user.fullName || user.FullName || 'Seller'}
          </h3>
          <p className="text-sm text-gray-500">Seller Account</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-sm">
          <Mail className="w-4 h-4 text-[#00A884]" />
          <span className="text-gray-700">{user.email}</span>
        </div>
        
        {user.phone && (
          <div className="flex items-center space-x-3 text-sm">
            <Phone className="w-4 h-4 text-[#00A884]" />
            <span className="text-gray-700">{user.phone}</span>
          </div>
        )}
        
        {user.address && (
          <div className="flex items-center space-x-3 text-sm">
            <MapPin className="w-4 h-4 text-[#00A884]" />
            <span className="text-gray-700">{user.address}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Trạng thái</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Hoạt động
          </span>
        </div>
      </div>
    </div>
  );
};

export default SellerInfoCard;
