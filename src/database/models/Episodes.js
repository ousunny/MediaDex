module.exports = (sequelize, DataTypes) => {
    const Episodes = sequelize.define(
        'episodes',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            number: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            location: {
                type: DataTypes.STRING,
            },
            series_id: {
                type: DataTypes.INTEGER,
            },
        },
        { underscored: true, timestamps: false }
    );

    return Episodes;
};
