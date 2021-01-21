import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Card, CardContent } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    card: {
        width: '240px',
    },
}));

const SeriesItem = ({ show: { id, title } }) => {
    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography variant="h5">{title}</Typography>
            </CardContent>
        </Card>
    );
};

export default SeriesItem;
