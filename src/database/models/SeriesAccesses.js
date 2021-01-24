module.exports = (sequelize, DataTypes) => {
    const SeriesAccesses = sequelize.define(
        'series_accesses',
        {
            series_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            last_accessed: {
                type: DataTypes.DATE,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        { underscored: true, timestamps: false }
    );
    return SeriesAccesses;
};
