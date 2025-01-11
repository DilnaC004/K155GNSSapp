const fieldCalculations = {};

fieldCalculations.trig = (zenith, distance, distanceType) => {
    if (zenith >= 200) {
        zenith = 400 - zenith;
    }
    switch (distanceType) {
        case 1:
            var height = distance * Math.cos(zenith * Math.PI / 200);
            return height;
        case 2:
            var height = distance * Math.sin(zenith * Math.PI / 200);
            if (zenith > 100) {
                return -height;
            }
            return height;
    }
};

export default fieldCalculations;