
class StringParser {

    static DELIMITER = ",";

    static getNthCsv(string, n) {
        return string.split(StringParser.DELIMITER)[n];
    }

    static setNthCsv(string, n, newValue) {
        let result = "";
        let parts = string.split(StringParser.DELIMITER);
        for (let i = 0; i < n; i++) {
            result += parts[i];
            result += StringParser.DELIMITER;
        }
        result += newValue;
        // Check if there are more CSVs to add
        if (n < parts.length - 1) {
            result += StringParser.DELIMITER;
        } else {
            // Avoid reaching the code below, otherwise the last CSV will be duplicated
            return result;
        }
        // Add remaining CSVs
        for (let i = n + 1; i < parts.length - 1; i++) {
            result += parts[i];
            result += StringParser.DELIMITER;
        }
        result += parts[parts.length - 1];
        return result;
    }

    static getMthThruNthCsv(string, m, n) {
        let parts = string.split(",");
        let result = "";
        for (let i = m; i < n; i++) {
            result += parts[i];
            result += StringParser.DELIMITER;
        }
        result += parts[n];
        return result;
    }

    static setMthTruNthCsv(string, m, n, replacement) {
        let result = "";
        let parts = string.split(StringParser.DELIMITER);
        for (let i = 0; i < m; i++) {
            result += parts[i];
            result += StringParser.DELIMITER;
        }
        result += replacement;
        // Check if there are more CSVs to add
        if (n < parts.length - 1) {
            result += StringParser.DELIMITER;
        } else {
            // Avoid reaching the code below, otherwise the last CSV will be duplicated
            return result;
        }
        // Add remaining CSVs
        for (let i = n + 1; i < parts.length - 1; i++) {
            result += parts[i];
            result += StringParser.DELIMITER;
        }
        result += parts[parts.length - 1];
        return result;
    }

    static getNthCsvInt(string, n) {
        return parseInt(StringParser.getNthCsv(string, n));
    }

}