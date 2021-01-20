module.exports = (sequelize, DataTypes) => {
    const SeriesEpisodes = sequelize.define(
        'series_episodes',
        {
            series_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            episode_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
        },
        { underscored: true, timestamps: false }
    );
    return SeriesEpisodes;
};
