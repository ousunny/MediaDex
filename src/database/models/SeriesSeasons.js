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
                references: {
                    model: 'series',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
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
