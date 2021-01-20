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
        },
        { underscored: true, timestamps: false }
    );

    return Episodes;
};
