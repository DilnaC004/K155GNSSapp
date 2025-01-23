const fieldCalculations = {};

fieldCalculations.trig = (zenith, distance, distanceType) => {
    if (zenith >= 200) {
        zenith = 400 - zenith;
    }
    switch (distanceType) {
        case 1:
            var height = distance / Math.tan(zenith * Math.PI / 200);
            return height;
        case 2:
            if (zenith > 100) {
                var height = distance * Math.sin((zenith-100) * Math.PI / 200);
                return -height;
            } else {
                var height = distance * Math.sin(zenith * Math.PI / 200);
                return height;
            }            
    }
};

fieldCalculations.triangle = (alpha, beta, gamma, permitedMisclosure) => {
    const calculatedMisclosure = (alpha + beta + gamma - 200) * 10000;
    const isWithin = Math.abs(calculatedMisclosure) <= (typeof permitedMisclosure === 'number' ? permitedMisclosure : 200);
    return [calculatedMisclosure, isWithin];
};

fieldCalculations.leveling = (forward, back, k, L) => {
    const deviation = (forward + back) * 1000;
    const permitedDeviation = (typeof k === 'number'? k : 40) * Math.sqrt(L);
    const isWithin = Math.abs(deviation) <= permitedDeviation;
    return [deviation, permitedDeviation, isWithin];
};

export default fieldCalculations;