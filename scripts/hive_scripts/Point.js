
class Point {

    static OFFBOARD = 99;
    static OFFBOARD_POINT = "99,99";
    static POINT_MATCH_PIECE_ERROR_MESSAGE = "It looks like you're checking if a point matches a piece. This is probably a mistake.";

    static build(a, b) {
        return a + "," + b;
    }

    static getA(pointString) {
        return StringParser.getNthCsvInt(pointString, 0);
    }

    static getB(pointString) {
        return StringParser.getNthCsvInt(pointString, 1);
    }

    static shift(point1, point2) {
        return Point.build(Point.getA(point1) + Point.getA(point2), Point.getB(point1) + Point.getB(point2));
    }

}