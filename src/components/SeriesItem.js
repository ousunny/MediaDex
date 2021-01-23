import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Typography,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({}));

const SeriesItem = ({ displayDetailView, show: { id, title } }) => {
    const classes = useStyles();

    const handleCardClick = (event) => {
        displayDetailView(true);
    };

    return (
        <Card style={{ height: '100%' }}>
            <CardActionArea onClick={handleCardClick}>
                <CardMedia component="img" height="200" />
                <CardContent>
                    <Typography variant="h5">{title}</Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default SeriesItem;
