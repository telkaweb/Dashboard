// @mui
// import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
// types
import { IContactParticipant } from 'src/types/contact';
//
import SearchNotFound from 'src/components/search-not-found';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  searchQuery: string;
  searchResults: IContactParticipant[];
  onClickResult: (contact: IContactParticipant) => void;
};

export default function ContactNavSearchResults({ searchQuery, searchResults, onClickResult }: Props) {
  const totalResults = searchResults.length;

  const { t } = useLocales();

  const notFound = !totalResults && !!searchQuery;

  return (
    <>
      <Typography
        paragraph
        variant="h6"
        sx={{
          px: 2.5,
        }}
      >
        {t('customer') ?? "Customer"} ({totalResults})
      </Typography>

      {notFound ? (
        <SearchNotFound
          query={searchQuery}
          sx={{
            p: 3,
            mx: 'auto',
            width: `calc(100% - 40px)`,
            bgcolor: 'background.neutral',
          }}
        />
      ) : (
        <>
          {searchResults.map((result) => (
            <ListItemButton
              key={result.id}
              onClick={() => onClickResult(result)}
              sx={{
                px: 2.5,
                py: 1.5,
                typography: 'subtitle2',
              }}
            >
              {/* <Avatar alt={result.name} src={result.avatarUrl} sx={{ mr: 2 }} /> */}
              {result.name} {result.family} - {result.phoneNumber}
            </ListItemButton>
          ))}
        </>
      )}
    </>
  );
}
