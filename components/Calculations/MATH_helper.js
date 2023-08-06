// MathUtils.js

const MATH = {};

MATH.sind = (degree) => {
  const radians = degree * (Math.PI / 180);
  return Math.sin(radians);
};

MATH.asind = (value) => {
  const radians = Math.asin(value);
  return radians * (180 / Math.PI);
};

MATH.cosd = (degree) => {
  const radians = degree * (Math.PI / 180);
  return Math.cos(radians);
};

MATH.acosd = (value) => {
  const radians = Math.acos(value);
  return radians * (180 / Math.PI);
};

MATH.tand = (degree) => {
  const radians = degree * (Math.PI / 180);
  return Math.tan(radians);
};

MATH.atand = (value) => {
  const radians = Math.atan(value);
  return radians * (180 / Math.PI);
};

MATH.cotd = (degree) => {
  const radians = degree * (Math.PI / 180);
  return 1 / Math.tan(radians);
};

MATH.acotd = (value) => {
  const radians = Math.PI / 2 - Math.atan(value);
  return radians * (180 / Math.PI);
};

export default MATH;
