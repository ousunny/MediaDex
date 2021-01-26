module.exports = (sequelize, DataTypes) => {
    const SeriesSeasons = sequelize.define(
        'series_seasons',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            series_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            favorite: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            directory_location: {
                type: DataTypes.STRING,
            },
            image_location: {
                type: DataTypes.STRING,
            },
            summary: {
                type: DataTypes.STRING,
            },
            current_season: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        { underscored: true, timestamps: false }
    );
    return SeriesSeasons;
};
