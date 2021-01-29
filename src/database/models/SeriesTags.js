module.exports = (sequelize, DataTypes) => {
    const SeriesTags = sequelize.define(
        'series_tags',
        {
            series_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                onDelete: 'CASCADE',
            },
            tag_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                onDelete: 'CASCADE',
            },
        },
        { underscored: true, timestamps: false }
    );
    return SeriesTags;
};
