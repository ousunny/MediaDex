import React, { Fragment } from 'react';
import { Typography, Grid, Grow } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SeriesItem from './SeriesItem';

const useStyles = makeStyles((theme) => ({}));

const Bookmarks = ({ displayDetailView, seriesBookmarks }) => {
    const classes = useStyles();

    return (
        <Fragment>
            {seriesBookmarks.length !== 0 && (
                <Fragment>
                    <Typography variant="h3">Recent</Typography>
                    <Grid container spacing={5}>
                        {seriesBookmarks.map((show, index) => (
                            <Grid item xs={3} key={show.id}>
                                <Grow in={true} timeout={200 * (index + 1)}>
                                    <div>
                                        <SeriesItem
                                            displayDetailView={
                                                displayDetailView
                                            }
                                            show={show}
                                        />
                                    </div>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                </Fragment>
            )}
        </Fragment>
    );
};

export default Bookmarks;
