import React, { Fragment, useEffect } from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    selected: {
        backgroundColor: '#f2f2f2',
        color: '#111',
    },
}));

const Browse = () => {
    const classes = useStyles();
    const [selectedLetter, setSelectedLetter] = React.useState('');
    const [alphabet, setAlphabet] = React.useState([]);
    const loaded = React.useRef(false);

    useEffect(() => {
        if (!loaded.current) {
            setAlphabet(generateAlphabet('A', 'Z'));

            loaded.current = true;
        }
    }, []);

    const generateAlphabet = (start, end) => {
        let alphabetArray = [];
        for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
            alphabetArray.push(String.fromCharCode(i));
        }

        return alphabetArray;
    };

    const handleLetterClick = (letter) => {
        setSelectedLetter(letter);
    };

    return (
        <Fragment>
            <Grid container>
                <Grid container item xs={12}>
                    {alphabet.map((letter) => (
                        <Button
                            key={letter}
                            onClick={() => handleLetterClick(letter)}
                            className={clsx({
                                [classes.selected]: letter === selectedLetter,
                            })}
                        >
                            <Typography variant="button">{letter}</Typography>
                        </Button>
                    ))}
                </Grid>
            </Grid>
        </Fragment>
    );
};

export default Browse;
