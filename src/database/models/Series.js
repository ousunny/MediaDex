module.exports = (sequelize, DataTypes) => {
    const Series = sequelize.define(
        'series',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            airing_season: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            airing_year: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        { underscored: true, timestamps: false }
    );

    return Series;
};
