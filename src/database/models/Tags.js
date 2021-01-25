module.exports = (sequelize, DataTypes) => {
    const Tags = sequelize.define(
        'tags',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            tag_name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
        },
        { underscored: true, timestamps: false }
    );
    return Tags;
};
