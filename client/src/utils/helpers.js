// Helper functions for countdown timers, freshness indicators, and formatting

export function getTimeRemaining(expiresAt) {
  const total = Date.parse(expiresAt) - Date.now();
  if (total <= 0) {
    return {
      total: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      label: 'Expired',
      urgency: 'critical'
    };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor(total / (1000 * 60 * 60));

  let label = '';
  if (hours > 0) {
    label = `${hours}h ${minutes}m left`;
  } else if (minutes > 0) {
    label = `${minutes}m ${seconds}s left`;
  } else {
    label = `${seconds}s left`;
  }

  let urgency = 'normal'; // > 4 hours
  if (hours < 1.5) {
    urgency = 'critical'; // < 1.5 hours
  } else if (hours < 4) {
    urgency = 'high'; // 1.5h - 4h
  }

  return {
    total,
    hours,
    minutes,
    seconds,
    isExpired: false,
    label,
    urgency
  };
}

export function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getDietaryBadge(dietaryType) {
  switch ((dietaryType || '').toLowerCase()) {
    case 'vegetarian':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Pure Veg'
      };
    case 'vegan':
      return {
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500',
        label: 'Vegan'
      };
    case 'non-vegetarian':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Non-Veg'
      };
    case 'jain':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Jain Friendly'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: dietaryType || 'Food'
      };
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case 'AVAILABLE':
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        label: 'Available for Rescue'
      };
    case 'CLAIMED':
      return {
        bg: 'bg-sky-100 text-sky-800 border-sky-300',
        label: 'Courier Assigned'
      };
    case 'PICKED_UP':
      return {
        bg: 'bg-purple-100 text-purple-800 border-purple-300',
        label: 'In Transit'
      };
    case 'DELIVERED':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        label: 'Delivered & Served'
      };
    case 'EXPIRED':
      return {
        bg: 'bg-red-100 text-red-800 border-red-300',
        label: 'Expired'
      };
    default:
      return {
        bg: 'bg-gray-100 text-gray-700 border-gray-300',
        label: status
      };
  }
}
