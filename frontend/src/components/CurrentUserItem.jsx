import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import React from 'react'
import SettingsIcon from '@mui/icons-material/Settings';
import { useDispatch } from 'react-redux'
import { logoutUser } from '../redux/slices/userSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
function CurrentUserItem(props) {

    const { username, avatar } = props;

    const navigation = useNavigate()

    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = React.useState(null);

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();

        try {
            dispatch(logoutUser())
            toast.success('Çıkış Yapıldı!', {
                autoClose: 1500,
            })
            navigation('/')
        } catch (error) {
            console.log(error);
        }

    }

    return (
        <Box display={'flex'} width={'100%'}
            p={1}
            alignItems={'center'}
        >
            <Box display={'flex'} width={'90%'} alignItems={'center'} justifyContent={'space-between'}>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={handleClose}>Profile Settings</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
                <Box
                    width={'2.2em'}
                    dangerouslySetInnerHTML={{ __html: avatar }} />

                <Typography ml={2} color='white' variant='body1'>{username}</Typography>
                <IconButton onClick={handleClick} >
                    <SettingsIcon sx={{ color: 'white' }} />
                </IconButton>
            </Box>
        </Box>
    )
}

export default CurrentUserItem