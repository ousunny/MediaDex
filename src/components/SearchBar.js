import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { OutlinedInput } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { ipcRenderer } from 'electron';

const useStyles = makeStyles((theme) => ({
    search: {
        width: '100%',
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

const SearchBar = ({ handleNavClick }) => {
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleSearchChange = (event) => {
        // console.log(event.target.value);
        setSearchTerm(event.target.value);
        ipcRenderer.send('series:search', event.target.value);
    };

    return (
        <div className={classes.search}>
            <OutlinedInput
                placeholder="Search..."
                variant="outlined"
                fullWidth
                value={searchTerm}
                onClick={() => handleNavClick(2)}
                onChange={handleSearchChange}
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
