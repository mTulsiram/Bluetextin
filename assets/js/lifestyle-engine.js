
window.LifestyleEngine = {
  mifflinStJeor: function(weight, height, age, gender) {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    return 10 * weight + 6.25 * height - 5 * age - 161;
  },
  duboisBSA: function(weight, height) {
    return 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);
  },
  usNavyBodyFat: function(waist, neck, hip, height, gender) {
    if (gender === 'male') {
      return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    }
    return 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
  }
};
