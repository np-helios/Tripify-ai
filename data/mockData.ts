export const onboardingData = [
  {
    id: 1,
    title: 'Discover Ladakh',
    subtitle: 'Explore the beauty of the Himalayas with our AI-powered guide',
    image: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2,
    title: 'AI Travel Assistant',
    subtitle: 'Get instant answers about places, weather, and local culture',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3,
    title: 'Offline Ready',
    subtitle: 'Access maps and information even without internet connection',
    image: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const placesData = [
  {
    id: 1,
    name: 'Pangong Lake',
    category: 'Lakes',
    image: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Crystal clear high-altitude lake',
    altitude: '4,350m',
    distance: '160km from Leh',
    tags: ['Photography', 'Nature', 'Camping'],
  },
  {
    id: 2,
    name: 'Nubra Valley',
    category: 'Routes',
    image: 'https://images.pexels.com/photos/2516403/pexels-photo-2516403.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Valley of flowers with sand dunes',
    altitude: '3,048m',
    distance: '120km from Leh',
    tags: ['Desert', 'Camel Safari', 'Monasteries'],
  },
  {
    id: 3,
    name: 'Hemis Monastery',
    category: 'Temples',
    image: 'https://images.pexels.com/photos/3571551/pexels-photo-3571551.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Largest monastery in Ladakh',
    altitude: '3,505m',
    distance: '45km from Leh',
    tags: ['Culture', 'History', 'Buddhism'],
  },
  {
    id: 4,
    name: 'Tso Moriri Lake',
    category: 'Lakes',
    image: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Pristine high-altitude lake',
    altitude: '4,595m',
    distance: '240km from Leh',
    tags: ['Wildlife', 'Photography', 'Camping'],
  },
];

export const downloadData = [
  {
    id: 1,
    name: 'AI Model (Phi-3 Mini)',
    size: '250MB',
    status: 'installed',
    description: 'Offline language model for travel assistance',
  },
  {
    id: 2,
    name: 'Ladakh Offline Maps',
    size: '50MB',
    status: 'available',
    description: 'Detailed maps with GPS navigation',
  },
  {
    id: 3,
    name: 'Cultural Guide Data',
    size: '80MB',
    status: 'available',
    description: 'Local customs, language, and traditions',
  },
  {
    id: 4,
    name: 'Weather Data Cache',
    size: '25MB',
    status: 'downloading',
    progress: 0.7,
    description: 'Historical weather patterns and forecasts',
  },
];

export const chatSuggestions = [
  'What should I pack for Ladakh?',
  'Best time to visit Pangong Lake?',
  'Local food recommendations in Leh',
  'Altitude sickness prevention tips',
  'Photography spots in Nubra Valley',
  'Cultural etiquette in monasteries',
];

export const quickAccessItems = [
  {
    id: 1,
    title: 'Ask AI',
    subtitle: 'Travel questions & tips',
    route: '/chat',
    color: '#A3D9FF',
  },
  {
    id: 2,
    title: 'Explore Places',
    subtitle: 'Discover destinations',
    route: '/places',
    color: '#A77948',
  },
  {
    id: 3,
    title: 'Plan Trip',
    subtitle: 'Create itineraries',
    route: '/planner',
    color: '#4CAF50',
  },
  {
    id: 4,
    title: 'Downloads',
    subtitle: 'Offline content',
    route: '/downloads',
    color: '#FF9800',
  },
];