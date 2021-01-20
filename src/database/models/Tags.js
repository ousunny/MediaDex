module.exports = (sequelize, DataTypes) => {
    const Tags = sequelize.define(
        'tags',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            tag_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        { underscored: true, timestamps: false }
    );
    return Tags;
};
