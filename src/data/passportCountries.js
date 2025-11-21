// Comprehensive passport photo requirements database
const passportCountries = {
  US: {
    name: 'United States',
    size: { width: 2, height: 2, unit: 'inches' },
    dpi: 300,
    background: '#FFFFFF',
    headSize: { min: 50, max: 69, percentage: 70 },
    eyeLevel: { percentage: 60 },
    requirements: [
      'Head must be between 1 inch and 1 3/8 inches (25mm - 35mm) from bottom of chin to top of head',
      'Photo must be taken within the last 6 months',
      'White or off-white background',
      'Face must be directly facing the camera',
      'Neutral facial expression with both eyes open'
    ]
  },
  GB: {
    name: 'United Kingdom',
    size: { width: 35, height: 45, unit: 'mm' },
    dpi: 300,
    background: '#F5F5F5',
    headSize: { min: 29, max: 34, percentage: 80 },
    eyeLevel: { percentage: 50 },
    requirements: [
      'Photo must be 35mm wide and 45mm high',
      'Head must be between 29mm and 34mm from chin to crown',
      'Plain light grey or cream background',
      'Face must be in sharp focus and clear',
      'No shadows on face or behind head'
    ]
  },
  CA: {
    name: 'Canada',
    size: { width: 50, height: 70, unit: 'mm' },
    dpi: 300,
    background: '#FFFFFF',
    headSize: { min: 31, max: 36, percentage: 70 },
    eyeLevel: { percentage: 60 },
    requirements: [
      'Photo must be 50mm wide and 70mm high',
      'Head must be between 31mm and 36mm from chin to crown',
      'Plain white or light-colored background',
      'Face must be in focus with neutral expression',
      'Both eyes must be clearly visible'
    ]
  },
  IN: {
    name: 'India',
    size: { width: 35, height: 45, unit: 'mm' },
    dpi: 300,
    background: '#FFFFFF',
    headSize: { min: 25, max: 35, percentage: 70 },
    eyeLevel: { percentage: 60 },
    requirements: [
      'Photo must be 35mm wide and 45mm high',
      'Head must be between 25mm and 35mm from chin to crown',
      'White background',
      'Face must be directly facing camera',
      'Neutral expression with mouth closed'
    ]
  },
  AU: {
    name: 'Australia',
    size: { width: 35, height: 45, unit: 'mm' },
    dpi: 300,
    background: '#F5F5F5',
    headSize: { min: 32, max: 36, percentage: 75 },
    eyeLevel: { percentage: 55 },
    requirements: [
      'Photo must be 35mm wide and 45mm high',
      'Head must be between 32mm and 36mm from chin to crown',
      'Plain light-colored background',
      'Face must be in sharp focus',
      'Neutral expression with mouth closed'
    ]
  },
  DE: {
    name: 'Germany',
    size: { width: 35, height: 45, unit: 'mm' },
    dpi: 300,
    background: '#F5F5F5',
    headSize: { min: 32, max: 36, percentage: 75 },
    eyeLevel: { percentage: 55 },
    requirements: [
      'Photo must be 35mm wide and 45mm high',
      'Head must be between 32mm and 36mm',
      'Plain light grey background',
      'Face must be centered and in focus',
      'Neutral expression, mouth closed'
    ]
  },
  FR: {
    name: 'France',
    size: { width: 35, height: 45, unit: 'mm' },
    dpi: 300,
    background: '#F5F5F5',
    headSize: { min: 32, max: 36, percentage: 75 },
    eyeLevel: { percentage: 55 },
    requirements: [
      'Photo must be 35mm wide and 45mm high',
      'Head must be between 32mm and 36mm',
      'Light grey or light blue background',
      'Face must be centered',
      'Neutral expression'
    ]
  },
  JP: {
    name: 'Japan',
    size: { width: 35, height: 45, unit: 'mm' },
    dpi: 300,
    background: '#FFFFFF',
    headSize: { min: 32, max: 36, percentage: 75 },
    eyeLevel: { percentage: 55 },
    requirements: [
      'Photo must be 35mm wide and 45mm high',
      'Head must be between 32mm and 36mm',
      'White or light blue background',
      'Face must be directly facing camera',
      'Neutral expression'
    ]
  },
  CN: {
    name: 'China',
    size: { width: 33, height: 48, unit: 'mm' },
    dpi: 300,
    background: '#FFFFFF',
    headSize: { min: 28, max: 33, percentage: 70 },
    eyeLevel: { percentage: 60 },
    requirements: [
      'Photo must be 33mm wide and 48mm high',
      'Head must be between 28mm and 33mm',
      'White background',
      'Face must be centered',
      'Neutral expression with eyes open'
    ]
  },
  BR: {
    name: 'Brazil',
    size: { width: 50, height: 70, unit: 'mm' },
    dpi: 300,
    background: '#FFFFFF',
    headSize: { min: 32, max: 36, percentage: 70 },
    eyeLevel: { percentage: 60 },
    requirements: [
      'Photo must be 50mm wide and 70mm high',
      'Head must be between 32mm and 36mm',
      'White background',
      'Face must be in focus',
      'Neutral expression'
    ]
  }
};

export default passportCountries;
