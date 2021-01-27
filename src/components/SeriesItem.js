import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Typography,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
} from '@material-ui/core';
const path = require('path');

const useStyles = makeStyles((theme) => ({}));

const SeriesItem = ({ displayDetailView, show }) => {
    const classes = useStyles();

    const handleCardClick = (event) => {
        displayDetailView(true, show);
    };

    return (
        <Card style={{ height: '100%' }}>
            <CardActionArea onClick={handleCardClick}>
                <CardMedia
                    component="img"
                    image={path.join(
                        'file://',
                        show.series_seasons[0].image_location
                    )}
                    height="250"
                />
                <CardContent>
                    <Typography variant="subtitle1">{`${show.title} - S${show.series_seasons[0].current_season}`}</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default SeriesItem;
