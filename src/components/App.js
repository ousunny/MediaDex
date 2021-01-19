import React from 'react';
import {
    makeStyles,
    ThemeProvider,
    createMuiTheme,
} from '@material-ui/core/styles';
import {
    Button,
    CssBaseline,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import SearchBar from './SearchBar';
import Home from './Home';
import Bookmarks from './Bookmarks';
import Browse from './Browse';
import MediaAdd from './MediaAdd';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const drawerWidth = '240px';
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        textAlign: 'center',
    },
    drawerPaper: {
        width: drawerWidth,
    },
    logo: {
        fontSize: '3rem',
        margin: '1rem',
    },
    nav: {
        margin: 'auto',
        width: '100%',
    },
    navItems: {
        padding: '0 1rem',
        fontSize: '2rem',
        textAlign: 'right',
    },
    content: {
        padding: theme.spacing(3),
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    actions: {
        margin: '1rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    searchBar: {
        width: '80%',
    },
    add: {
        padding: '1rem',
        height: '100%',
        position: 'absolute',
        right: 0,
    },
}));

const App = () => {
    const classes = useStyles();
    const [nav, setNav] = React.useState(0);
    const [addOpen, setAddOpen] = React.useState(false);

    const handleNavClick = (index) => {
        setNav(index);
    };

    const handleAddClick = () => {
        addOpen ? setAddOpen(false) : setAddOpen(true);
    };

    return (
        <ThemeProvider className={classes.root} theme={darkTheme}>
            <CssBaseline />
            <Drawer
                className={classes.drawer}
                variant="permanent"
                anchor="left"
                classes={{ paper: classes.drawerPaper }}
            >
                <Typography className={classes.logo} variant="h1">
                    MediaDex
                </Typography>
                <List className={classes.nav}>
                    {['Home', 'Bookmarks', 'Browse'].map((text, index) => (
                        <ListItem
                            button
                            key={text}
                            value={index}
                            onClick={() => handleNavClick(index)}
                        >
                            <ListItemText
                                classes={{ primary: classes.navItems }}
                                primary={text}
                            />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.actions}>
                    <div className={classes.searchBar}>
                        <SearchBar />
                    </div>
                    <Button className={classes.add} onClick={handleAddClick}>
                        <Add />
                    </Button>
                </div>

                {nav === 0 ? <Home /> : nav === 1 ? <Bookmarks /> : <Browse />}
            </main>

            <MediaAdd open={addOpen} onClose={handleAddClick} />
        </ThemeProvider>
    );
};

export default App;
