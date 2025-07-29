import { Avatar, SvgIcon } from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import DeviceUnknownIcon from '@mui/icons-material/Devices';  // Fallback icon

interface DeviceAvatarProps {
    platform?: string;
}
type PlatformType = "Windows" | "Android" | "iOS" | "Bot" | "Unknown";

const WindowsIcon = () => (
    <SvgIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path d="M3 3h8v8H3zm10 0h8v8h-8zm0 10h8v8h-8zm-10 0h8v8H3z" />
    </SvgIcon>
);

const DeviceAvatar: React.FC<DeviceAvatarProps> = ({ platform }) => {
  let deviceIcon = <DeviceUnknownIcon />; // Default to Unknown device

  const normalizedPlatform: PlatformType = ["Windows", "Android", "iOS", "Bot"].includes(platform!)
    ? (platform as PlatformType)
    : "Unknown";

  // Conditionally set the icon based on the device type from the web service
  switch (normalizedPlatform) {
    case 'Windows':
      deviceIcon = <WindowsIcon />;
      break;
    case 'Android':
      deviceIcon = <AndroidIcon />;
      break;
    case 'iOS':
      deviceIcon = <AppleIcon />;
      break;
    case 'Bot':
      deviceIcon = <DeviceUnknownIcon />;
      break;
    default:
      deviceIcon = <DeviceUnknownIcon />;
      break;
  }

  return (
    <Avatar
      variant="rounded"
      sx={{ width: 48, height: 48, mr: 2 }}
    >
      {deviceIcon}
    </Avatar>
  );
};

export default DeviceAvatar;
