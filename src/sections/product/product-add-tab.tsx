import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Tab, Tabs, FormControl, InputLabel, Select, MenuItem, IconButton, Grid } from '@mui/material';
import { Delete, PictureAsPdf, VideoLibrary, MusicNote } from '@mui/icons-material';
import { useLocales } from 'src/locales';

interface MainDetail {
  unique_key: string;
  key: string;
  value: string;
}

interface HeadDetail {
  unique_key: string;
  key: string;
  main_details: MainDetail[];
}

interface FileDetail {
  unique_key: string;
  name: string;
  path: string;
  extension: string;
  size: string;
  fileId?: string; // File ID received from the backend after uploading
}

interface TabData {
  unique_key: string;
  title: string;
  description?: string;
  type: number; // 1 for text, 2 for image
  level?: number; 
  head_details?: HeadDetail[];
  files?: FileDetail[];
}
interface ProductRegistrationProps {
    setDataTab: (arg0: TabData[]) => void;
    oldTab: TabData[];
}

const ProductRegistration: React.FC<ProductRegistrationProps> = ({ setDataTab,oldTab }) => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const { t } = useLocales();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setDataTab(tabs);
    if (!initialized && oldTab.length > 0) {
      addOldTab(oldTab);
      setInitialized(true);
    }
  }, [tabs,setDataTab,oldTab,initialized]);  // Dependency array, runs whenever inputValue changes

  const handleTabChange = (event: React.SyntheticEvent, newIndex: number) => {
    setActiveTabIndex(newIndex);
  };

  const handleTabTitleChange = (tabIndex: number, value: string) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].title = value;
    setTabs(newTabs);
  };

  const handleTabTypeChange = (tabIndex: number, value: number) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].type = value;
    setTabs(newTabs);
  };

  const addOldTab = (existingTabs: TabData[]) => {
    const newTabs = existingTabs.map((tab) => ({
      ...tab,
      unique_key: tab.unique_key || `tab-${Math.random().toString(36).substr(2, 9)}`,
      title: tab.title || 'Title tab',
      type: tab.type || 1,
      level: tab.level || 1,
      head_details: tab.head_details || [], 
    }));

    setTabs((prevTabs) => {
      const updated = [...prevTabs, ...newTabs];
      setActiveTabIndex(updated.length - 1);
      return updated;
    });  

  };

  const addTab = () => {
    const newTab: TabData = {
      unique_key: `tab-${Math.random().toString(36).substr(2, 9)}`,
      title: t('tabs.new') ?? 'Title tab',
      type: 1,
      head_details: [],
    };
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabIndex(tabs.length); // Set the newly added tab as active
  };

  const deleteTab = (index: number) => {
    const newTabs = [...tabs];
    newTabs.splice(index, 1);
    setTabs(newTabs);

    // Update activeTabIndex if necessary
    if (activeTabIndex >= newTabs.length) {
      setActiveTabIndex(newTabs.length - 1);
    }
  };

  const addHeadDetail = (tabIndex: number) => {
    const newHeadDetail: HeadDetail = {
      unique_key: `headDetail-${Math.random().toString(36).substr(2, 9)}`,
      key: t('tabs.title_section') ?? 'Add Section',
      main_details: [],
    };
    const newTabs = [...tabs];
    newTabs[tabIndex].head_details?.push(newHeadDetail);
    setTabs(newTabs);
  };

  const addMainDetail = (tabIndex: number, headDetailIndex: number) => {
    const newMainDetail: MainDetail = {
      unique_key: `mainDetail-${Math.random().toString(36).substr(2, 9)}`,
      key: t('tabs.title_option') ?? 'Add Option',
      value: t('tabs.key_value') ?? 'New Value',
    };

    const newTabs = [...tabs];

    const tab = newTabs[tabIndex];
    if (!tab) return;

    if (!tab.head_details) {
      tab.head_details = [];
    }

    let headDetail = tab.head_details[headDetailIndex];
    if (!headDetail) {
      headDetail = {
        unique_key: `headDetail-${Math.random().toString(36).substr(2, 9)}`, 
        key: t('tabs.head_detail_key') ?? 'Head Detail', 
        main_details: [],
      };
      tab.head_details[headDetailIndex] = headDetail;
    }

    if (!headDetail.main_details) {
      headDetail.main_details = [];
    }

    headDetail.main_details.push(newMainDetail);
    setTabs(newTabs);
  };

  const deleteHeadDetail = (tabIndex: number, headDetailIndex: number) => {
    const newTabs = [...tabs];
    const tab = newTabs[tabIndex];
    if (!tab) return;

    if (!tab.head_details) {
      tab.head_details = [];
    }

    const headDetail = tab.head_details[headDetailIndex];
    if (!headDetail) return;

    tab.head_details.splice(headDetailIndex, 1);
    setTabs(newTabs);
  };

  const deleteMainDetail = (tabIndex: number, headDetailIndex: number, mainDetailIndex: number) => {
    const newTabs = [...tabs];
    const tab = newTabs[tabIndex];
    if (!tab) return;

    if (!tab.head_details) {
      tab.head_details = [];
    }

    const headDetail = tab.head_details[headDetailIndex];
    if (!headDetail || !headDetail.main_details) return;

    headDetail.main_details.splice(mainDetailIndex, 1);
    setTabs(newTabs);
  };

  const handleFileUpload = (tabIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target; // Destructure files directly from the event
    if (files) {
      const newTabs = [...tabs];
      Array.from(files).forEach((file) => {
        const newFileDetail: FileDetail = {
          unique_key: `file-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          path: URL.createObjectURL(file),
          extension: file.name.split('.').pop() || '',
          size: (file.size / 1024).toFixed(2), // size in KB
        };

        // Simulate the upload and get the file ID
        // simulateFileUpload(newFileDetail).then((fileId) => {
        //   newFileDetail.fileId = fileId;
        //   // Store the file details with the file ID in the tab's files array
        //   if (!newTabs[tabIndex].files) newTabs[tabIndex].files = [];
        //   newTabs[tabIndex].files.push(newFileDetail);
        //   setTabs(newTabs);
        // });

        // Simulate the upload and get the file ID
        simulateFileUpload(newFileDetail).then((fileId) => {
          newFileDetail.fileId = fileId;

          // Ensure the tab exists before modifying it
          if (!newTabs[tabIndex]) {
            return; // Early return if tab does not exist
          }

          // Ensure files is an array (initialize if undefined)
          const updatedTab = {
            ...newTabs[tabIndex], // Copy the existing tab data
            files: [
              ...(newTabs[tabIndex].files || []), // Ensure files is always an array
              newFileDetail, // Add the new file
            ],
          };

          // Update the newTabs array with the modified tab
          const updatedTabs = [...newTabs];
          updatedTabs[tabIndex] = updatedTab;

          // Ensure state is updated correctly by setting the newTabs array
          setTabs(updatedTabs);
        });


      });
    }
  };

  const simulateFileUpload = async (file: FileDetail) => 
    new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`file-id-${Math.random().toString(36).substr(2, 9)}`);
      }, 1000);
    });
  

  const handleDeleteFile = (tabIndex: number, fileIndex: number) => {
    const newTabs = [...tabs];
    newTabs[tabIndex].files?.splice(fileIndex, 1);
    setTabs(newTabs);
  };

  // Helper function to render the correct file preview based on file type
  const renderFilePreview = (file: FileDetail) => {
    const fileExtension = file.extension.toLowerCase();
  
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={file.path} alt={file.name} width={100} />;
    }
  
    if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
      return <audio controls src={file.path}><track kind="captions" /></audio>;
    }
  
    if (['mp4', 'mov', 'avi'].includes(fileExtension)) {
      return <video width={100} controls src={file.path}><track kind="captions" /></video>;
    }
  
    if (['pdf'].includes(fileExtension)) {
      return <PictureAsPdf style={{ fontSize: 50 }} />;
    }
  
    if (['mp3', 'wav'].includes(fileExtension)) {
      return <MusicNote style={{ fontSize: 50 }} />;
    }
  
    if (['mp4', 'mov'].includes(fileExtension)) {
      return <VideoLibrary style={{ fontSize: 50 }} />;
    }
  
    return <span>{file.name}</span>;
  };
  

  // const getJSONData = () => {
  //   return tabs;
  // };

  return (
    <Box>
    <Button variant="contained" color="secondary" onClick={addTab} style={{float:"left",marginTop:"5px"}}>
        {t('tabs.add_tab') ?? "Add Tab"}
    </Button>

    <Tabs value={activeTabIndex} onChange={handleTabChange} aria-label="Tabs">
        {tabs.map((tab, index) => (
          <Tab
            key={tab.unique_key}
            label={
              <Box display="flex" alignItems="center">
                {tab.title}
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    deleteTab(index);
                  }}
                  style={{ marginLeft: '8px', padding: 0 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            }
            value={index}
          />

        ))}
    </Tabs>

      {/* Tab Details */}
      {tabs[activeTabIndex] && (
        <Box sx={{mt:2}}>
            <Grid item xs={12} md={12}>
                <Box
                    display="flex" // Display both inputs in a row
                    justifyContent="space-between" // Space between them
                    alignItems="center" // Align them vertically in the center
                    columnGap={3}
                >
                    <FormControl fullWidth>
                        <TextField
                            label={t('tabs.new') ?? 'Tab Title'}
                            variant="outlined"
                            value={tabs[activeTabIndex]?.title || ''}
                            onChange={(e) => handleTabTitleChange(activeTabIndex, e.target.value)}
                            fullWidth
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>{t('tabs.type') ?? 'Type'}</InputLabel>
                        <Select
                            value={tabs[activeTabIndex].type}
                            onChange={(e) => handleTabTypeChange(activeTabIndex, e.target.value as number)}
                            label={t('tabs.type') ?? 'Type'}
                        >
                            <MenuItem value={1}>{t('tabs.text') ?? "Text"}</MenuItem>
                            <MenuItem value={2}>{t('tabs.file') ?? "Image"}</MenuItem>
                        </Select>
                    </FormControl>

                    {tabs[activeTabIndex].type === 1 && (
                        <Button onClick={() => addHeadDetail(activeTabIndex)} variant="outlined">
                            {t('tabs.add_section') ?? "Add Section"}
                        </Button>
                    )}
                </Box>
            </Grid>

          {tabs[activeTabIndex].type === 2 && (
            <div style={{marginTop:"10px"}}>
              <input type="file" multiple onChange={(e) => handleFileUpload(activeTabIndex, e)} />
              <div>
                {tabs[activeTabIndex].files?.map((file, index) => (
                  <div key={file.unique_key} style={{ display: 'flex', alignItems: 'center' }}>
                    {renderFilePreview(file)}
                    <span>{file.name}</span>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDeleteFile(activeTabIndex, index)}
                      style={{ marginLeft: '10px' }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories and Subcategories */}
          {tabs[activeTabIndex].type === 1 && (
          <div style={{marginTop:"10px"}}>           
            {tabs[activeTabIndex].head_details?.map((headDetail, headDetailIndex) => (
              <div style={{marginTop:"15px",float: "left",width: "95%"}} key={headDetail.unique_key}>
                    <Box
                    display="flex" // Align items in a row
                    alignItems="center" // Vertically center align the items
                    justifyContent="space-between" // Ensure space between items
                    columnGap={2} // Add space between items
                    sx={{width:"100%"}}
                    >
                    {/* TextField for Section Title */}
                    <TextField
                      label={t('tabs.title_section') ?? "Section title"}
                      variant="outlined"
                      value={headDetail.key}
                      onChange={(e) => {
                        const newTabs = [...tabs];
                        const activeTab = newTabs[activeTabIndex];
                        if (activeTab && activeTab.head_details) {
                          activeTab.head_details[headDetailIndex].key = e.target.value;
                          setTabs(newTabs);
                        }
                      }}
                      style={{ flex: 1 }}
                    />

                    {/* Delete Section Button */}
                    <Button
                        onClick={() => deleteHeadDetail(activeTabIndex, headDetailIndex)}
                        variant="outlined"
                        color="secondary"
                    >
                        {t('tabs.delete_section') ?? "Delete Section"}
                    </Button>

                    {/* Add Option Button */}
                    <Button
                        onClick={() => addMainDetail(activeTabIndex, headDetailIndex)}
                        variant="outlined"
                    >
                        {t('tabs.add_option') ?? "Add Option"}
                    </Button>
                    </Box>


                {headDetail.main_details.map((mainDetail, mainDetailIndex) => (
                    
                  <div key={mainDetail.unique_key} style={{marginTop:"10px",width:"95%",float:"left"}}>
                    <Box
                        display="flex" // Align items in a row
                        alignItems="center" // Vertically center align the items
                        justifyContent="space-between" // Ensure space between items
                        columnGap={2} // Add space between elements
                        sx={{width:"100%"}}
                    >
                    <TextField
                      label={t('tabs.title_option') ?? "Option title"}
                      variant="outlined"
                      fullWidth
                      value={mainDetail.key}
                      onChange={(e) => {
                        const newTabs = [...tabs];
                        const tab = newTabs[activeTabIndex];
                        if (!tab) return;

                        const headDetails = tab.head_details;
                        if (!headDetails) return;

                        const mainDetails = headDetails[headDetailIndex]?.main_details;
                        if (!mainDetails) return;

                        if (mainDetails[mainDetailIndex]) {
                          mainDetails[mainDetailIndex].key = e.target.value;
                          setTabs(newTabs);
                        }
                      }}
                    />

                    <TextField
                      label={t('tabs.key_value') ?? "Option value"}
                      variant="outlined"
                      fullWidth
                      value={mainDetail.value}
                      onChange={(e) => {
                        const newTabs = [...tabs];
                        const tab = newTabs[activeTabIndex];
                        if (!tab) return;

                        const headDetails = tab.head_details;
                        if (!headDetails) return;

                        const mainDetails = headDetails[headDetailIndex]?.main_details;
                        if (!mainDetails) return;

                        if (mainDetails[mainDetailIndex]) {
                          mainDetails[mainDetailIndex].value = e.target.value;
                          setTabs(newTabs);
                        }
                      }}
                    />
                        <Button onClick={() => deleteMainDetail(activeTabIndex, headDetailIndex, mainDetailIndex)} variant="outlined" color="secondary">
                        {t('tabs.delete_option') ?? "Delete option"}
                        </Button>
                    </Box>
                  </div>
                ))}
              </div>
            ))}
          </div>
          )}
        </Box>
      )}

    </Box>
  );
};

export default ProductRegistration;
