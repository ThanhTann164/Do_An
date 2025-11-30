function normalizeRole(rawRole) {
  if (!rawRole) return null;
  const roleString = typeof rawRole === 'string'
    ? rawRole
    : rawRole.toString ? rawRole.toString() : '';
  return roleString.trim().toLowerCase() || null;
}

function isSellerRole(rawRole) {
  return normalizeRole(rawRole) === 'seller';
}

function extractRole(source) {
  if (!source) return null;
  if (source.role) return source.role;
  if (source.Role) return source.Role;
  if (Array.isArray(source.roles) && source.roles.length > 0) {
    return source.roles[0];
  }
  if (Array.isArray(source.Roles) && source.Roles.length > 0) {
    return source.Roles[0];
  }
  return null;
}

module.exports = {
  normalizeRole,
  isSellerRole,
  extractRole
};



