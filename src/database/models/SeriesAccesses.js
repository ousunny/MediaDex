module.exports = (sequelize, DataTypes) => {
    const SeriesAccesses = sequelize.define(
        'series_accesses',
        {
            series_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'series',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            last_accessed: {
                type: DataTypes.DATE,
            },
        },
        { underscored: true, timestamps: false }
    );
    return SeriesAccesses;
};
