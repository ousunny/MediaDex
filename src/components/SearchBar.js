import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { OutlinedInput } from '@material-ui/core';
import { Search } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    search: {
        width: '80%',
        display: 'flex',
        position: 'relative',
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        right: 0,
        position: 'absolute',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputInput: {
        paddingRight: `calc(1em + ${theme.spacing(4)}px)`,
    },
}));

const SearchBar = () => {
    const classes = useStyles();

    return (
        <div className={classes.search}>
            <OutlinedInput
                placeholder="Search..."
                variant="outlined"
                fullWidth
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
            />
            <div className={classes.searchIcon}>
                <Search />
            </div>
        </div>
    );
};

export default SearchBar;
