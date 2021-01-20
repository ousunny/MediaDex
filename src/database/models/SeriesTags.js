module.exports = (sequelize, DataTypes) => {
    const SeriesTags = sequelize.define(
        'series_tags',
        {
            series_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            tag_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
        },
        { underscored: true, timestamps: false }
    );
    return SeriesTags;
};
