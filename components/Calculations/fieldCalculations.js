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

fieldCalculations.triangle = (alpha, beta, gamma, permitedMisclosure) => {
    const calculatedMisclosure = (alpha + beta + gamma - 200) * 10000;
    const isWithin = Math.abs(calculatedMisclosure) <= (typeof permitedMisclosure === 'number' ? permitedMisclosure : 200);
    return [calculatedMisclosure, isWithin];
};

export default fieldCalculations;