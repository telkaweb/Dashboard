'use client';

import { useCallback, useEffect, useState } from 'react';
import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { useLocales } from 'src/locales';

// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// types
import { IContactParticipant } from 'src/types/contact';

// redux
// import { useDispatch } from 'src/redux/store';

// routes
import { paths } from 'src/routes/paths';
import { useParams, useRouter, useSearchParams } from 'src/routes/hook';

// components
import { useSettingsContext } from 'src/components/settings';
import Toast from 'src/components/toast/Toast';

// hooks
import { useChat } from '../hooks';

// local components
import ContactNav from '../contact-nav'; 
import ContactRoom from '../contact-room';
import ContactMessageList from '../contact-message-list'; 
import ContactHeaderDetail from '../contact-header-detail'; 

// ----------------------------------------------------------------------
export const fetchData = async (
  accessToken: string | null,
  endPoint: string,
  method: 'GET' | 'POST' = 'GET',
  params = {}
) => {
  try {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    const response =
      method === 'GET'
        ? await axios.get(endPoint, { params })
        : await axios.post(endPoint, params);

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

function useInitial() {
  // const dispatch = useDispatch();

  // const router = useRouter();

  // const params = useParams();

  // const { id } = params as { id: "connection" | "inquiry" }; // Explicitly define type
  
  // const pageType: "connection" | "inquiry" = id; // Ensures valid type

  // const currentPath = paths.dashboard.contact[pageType]; // No more TypeScript errors
}

export default function ContactView() {
  useInitial();
  
  const { t } = useLocales();
  
  const params = useParams();

  const searchParams = useSearchParams();

  const router = useRouter(); // Initialize router

  const { id } = params as { id: "connection" | "inquiry" }; // Explicitly define type
  
  const pageType: "connection" | "inquiry" = id; // Ensures valid type

  const currentPath = paths.dashboard.contact[pageType]; // No more TypeScript errors

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const [contacts, setContacts] = useState<IContactParticipant[]>([]);

  const [conversations, setConversations] = useState<{ allIds: string[]; byId: Record<string, any> }>({
    allIds: [],
    byId: {},
  });

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  
  const showToast = (msg: string, level: "success" | "error" | "info" | "warning") => {
    setMessage(msg);
    setOpen(true);
    setSeverity(level);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const getContact = useCallback(async () => {
    try {
      if (!accessToken) return;
  
      const result = await fetchData(accessToken, API_ENDPOINTS.communication.contact(id), 'GET');
      if (result?.data) {
        setContacts(result?.data?.contacts);
      }
    } catch (err) {
      showToast(err?.status?.message, "error");
    }
  }, [accessToken, id]);
  
  const getConversation = useCallback(async () => {
    try {
      if (!accessToken) return;
  
      const result = await fetchData(accessToken, API_ENDPOINTS.communication.list(id), 'GET');
      if (result?.data) {
        const formattedConversations = {
          allIds: result?.data.map((item: any) => item.unique_key),
          byId: result?.data.reduce((acc: any, item: any) => {
            acc[item.unique_key] = item;
            return acc;
          }, {}),
        };
  
        setConversations(formattedConversations);
      }
    } catch (err) {
      showToast(err?.status?.message, "error");
    }
  }, [accessToken, id]);
  
  const conversationParam = searchParams.get('id');

  const currentConversation = conversationParam && conversations.byId[conversationParam] ? conversations.byId[conversationParam] : null;

  useEffect(() => {
    if (conversationParam) {
      setCurrentConversationId(conversationParam);
    }else{
      setCurrentConversationId(null);
    }
  }, [conversationParam]); // Re-run whenever `router.query` changes

  useEffect(() => {
    if (accessToken) {
      getContact();
      getConversation();
    }
  }, [accessToken,getContact,getConversation]);


  const settings = useSettingsContext();

  const {
    conversationsStatus,
  } = useChat();

  const onClickNavItem = (conversationId: string) => {
    try {
      if (conversationId) {
        setCurrentConversationId(conversationId);  // Set the current conversation ID
        router.push(`${currentPath}?id=${conversationId}`);
      }
    } catch (error) {
      console.error(error);
      router.push(currentPath);
    }
  };

  const details = !!currentConversationId;

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72 }}
    >
      {details && <ContactHeaderDetail participants={currentConversation} />}
    </Stack>
  );
  

  const renderNav = (
    <ContactNav
      contacts={contacts}
      conversations={conversations}
      onClickConversation={onClickNavItem}
      loading={conversationsStatus.loading}
      currentConversationId={currentConversationId}
    />
  );

  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <ContactMessageList
        messages={currentConversation}
      />

    </Stack>
  );

  return (
    <>
      <Toast open={open} message={message} severity={severity} onClose={() => setOpen(false)} />
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {t("communication") ?? "Communication"}
      </Typography>

      <Stack component={Card} direction="row" sx={{ height: '72vh' }}>
        {renderNav}

        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          {renderHead}

          <Stack
            direction="row"
            sx={{
              width: 1,
              height: 1,
              overflow: 'hidden',
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {renderMessages}

            {details && (
              <ContactRoom
                conversation={currentConversation}
              />
            )}
          </Stack>
        </Stack>
      </Stack>
      </Container>
    </>
  );
}
