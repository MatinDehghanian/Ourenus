import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material";
import PropTypes from "prop-types";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useMemo, useState } from "react";
import {
  extractNameFromConfigURL,
  handleCopyToClipboard,
} from "../utils/Helper";
import QrCodeIcon from "@mui/icons-material/QrCode";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";
import QrModal from "./QrModal";

const protocolLogos = {
  OpenVPN: "https://cdn.simpleicons.org/openvpn/EA7E20",
  WireGuard: "https://cdn.simpleicons.org/wireguard/88171A",
  "Cisco AnyConnect": "https://cdn.simpleicons.org/cisco/1BA0D7",
};

const Configs = ({
  title,
  icon,
  style,
  configs,
  profiles,
  iconColor,
  btnStyle,
  liStyle,
  isFirst,
}) => {
  const filteredLinks = useMemo(() => {
    const profileLinks = new Set(profiles.map((profile) => profile.qrValue));
    if (configs && configs[configs.length - 1] === "False") {
      return configs.slice(0, -1).filter((link) => !profileLinks.has(link));
    }
    return (configs || []).filter((link) => !profileLinks.has(link));
  }, [configs, profiles]);

  const { t } = useTranslation();
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(null);
  const [link, setLink] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const handleOpen = (title, link, index) => {
    setOpen(true);
    setModalTitle(title);
    setLink(link);
    setIndex(index);
  };
  const handleClose = () => setOpen(false);

  const isFirstPadding = isFirst && { paddingTop: "1rem" };
  const copyValues = [
    ...filteredLinks,
    ...profiles.map((profile) => profile.details || profile.qrValue).filter(Boolean),
  ];

  return (
    <>
      <Grid
        justifyContent="space-between"
        xs={11}
        item
        sx={{ paddingBottom: "1rem", ...isFirstPadding }}
      >
        <Accordion sx={style}>
          <AccordionSummary
            expandIcon={
              <ArrowDropDownIcon fontSize="large" sx={{ color: iconColor }} />
            }
            aria-controls="panel-os-content"
            id="panel-os-header"
          >
            <Grid container alignItems="center" justifyContent={"space-around"}>
              <Grid item xs={1} display="flex" justifyContent="center">
                {icon}
              </Grid>
              <Grid item xs={10} display="flex" justifyContent="center">
                <Typography>{title}</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {filteredLinks?.map((config, index) => {
                const title =
                  extractNameFromConfigURL(config) ||
                  config.split("://")[0]?.toUpperCase() ||
                  `${t("configuration")} ${index + 1}`;
                return (
                  <ListItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(title, filteredLinks?.[index], index);
                    }}
                    sx={liStyle}
                  >
                    <Grid
                      item
                      container
                      display={"flex"}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      flexWrap={"nowrap"}
                      gap={".3rem"}
                    >
                      <Grid item>
                        <Typography>{title}</Typography>
                      </Grid>
                      <Grid item display={"flex"} gap={".5rem"}>
                        <QrCodeIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(title, filteredLinks?.[index], index);
                          }}
                          fontSize="large"
                          sx={btnStyle}
                        />
                        <ContentCopyIcon
                          fontSize="large"
                          sx={btnStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(
                              filteredLinks?.[index],
                              index
                            );
                          }}
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                );
              })}
              {profiles.map((profile, index) => (
                <ListItem key={`${profile.protocol}-${profile.name}-${index}`} sx={liStyle}>
                  <Grid
                    item
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="nowrap"
                    gap=".5rem"
                  >
                    <Grid item display="flex" alignItems="center" gap=".6rem" sx={{ minWidth: 0 }}>
                      {protocolLogos[profile.protocol] && (
                        <img
                          src={protocolLogos[profile.protocol]}
                          alt={`${profile.protocol} logo`}
                          width="28"
                          height="28"
                        />
                      )}
                      <Grid item sx={{ minWidth: 0 }}>
                        <Typography>{profile.name}</Typography>
                        <Typography variant="caption" display="block">
                          {profile.protocol}
                        </Typography>
                        {profile.details && (
                          <Typography
                            component="pre"
                            variant="caption"
                            sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0 }}
                          >
                            {profile.details}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                    <Grid item display="flex" gap=".5rem">
                      {profile.downloadUrl && (
                        <IconButton
                          component="a"
                          href={profile.downloadUrl}
                          aria-label={t("download")}
                          sx={{ ...btnStyle, color: "inherit" }}
                        >
                          <DownloadIcon fontSize="large" />
                        </IconButton>
                      )}
                      {profile.qrValue && (
                        <IconButton
                          aria-label="QR"
                          onClick={() =>
                            handleOpen(profile.name, profile.qrValue, index)
                          }
                          sx={btnStyle}
                        >
                          <QrCodeIcon fontSize="large" />
                        </IconButton>
                      )}
                      {(profile.details || profile.qrValue) && (
                        <IconButton
                          aria-label="Copy"
                          sx={btnStyle}
                          onClick={() =>
                            handleCopyToClipboard(
                              profile.details || profile.qrValue,
                              index,
                              t
                            )
                          }
                        >
                          <ContentCopyIcon fontSize="large" />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
            {copyValues.length > 0 && (
              <Button
                onClick={() =>
                  handleCopyToClipboard(copyValues.join("\n"), -1, t)
                }
                sx={{
                  width: "100%",
                  background: theme.colors.glassColor,
                  color: "#000",
                  borderRadius: "16px",
                  border: "1px solid #48444a4f",
                  "&:hover": {
                    background: "rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                {t("copyAll")}
              </Button>
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
      <QrModal
        open={open}
        handleClose={handleClose}
        title={modalTitle}
        link={link}
        index={index}
        id="clist"
      />
    </>
  );
};

Configs.propTypes = {
  btnStyle: PropTypes.object,
  title: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  style: PropTypes.object,
  configs: PropTypes.arrayOf(PropTypes.string).isRequired,
  profiles: PropTypes.arrayOf(
    PropTypes.shape({
      protocol: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      downloadUrl: PropTypes.string,
      qrValue: PropTypes.string,
      details: PropTypes.string,
    })
  ),
  iconColor: PropTypes.string,
  liStyle: PropTypes.object,
  isFirst: PropTypes.bool,
};

Configs.defaultProps = {
  profiles: [],
};

export default Configs;
