exports.dataUnitConveter = {
    convertToIncreaseDataUnits: function (data, type, upToUnitsRange) {
        const units = ["BYTE", "KB", "MB", "GB", "TB"];
        let unitIndex = units.indexOf(type);
        if (unitIndex === -1) throw new Error('Invalid unit type');
        if (upToUnitsRange) {
            while (units[unitIndex] != upToUnitsRange) {
                data /= 1024;
                unitIndex++;
            }
        } else {
            while (data >= 1024 && unitIndex < units.length - 1) {
                data /= 1024;
                unitIndex++;
            }
        }
        return `${Math.floor(data * 100) / 100} ${units[unitIndex]}`;
    },
    convertToDecreaseDataUnits: function (data, type) {
        const units = ["BYTE", "KB", "MB", "GB", "TB"];
        let unitIndex = units.indexOf(type);
        if (unitIndex === -1) throw new Error('Invalid unit type');
        while (unitIndex > 0) {
            data *= 1024;
            unitIndex--;
        }
        return data;
    }
}