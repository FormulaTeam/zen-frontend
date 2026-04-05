import { Box, Collapse, IconButton, Link, Typography } from "@mui/material";
import {
  AnswerBox,
  ContainerDiv,
  HelpCard,
  HelpCardContainer,
  HelpCardDivider,
  HelpCardSubTitle,
  HelpCardTitle,
  HelpQandABox,
  HelpQandAList,
  QandAListItem,
  QuestionTitle,
  RegularAnswerText,
} from "./styled";
import { List } from "@mui/material";
import { useEffect, useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Config } from "../../utils/interfaces";
import { getConfig } from "../../api";
import { showErrorNotification } from "../../utils/utils";
import Loader from "../Responses/Loader";
import { theme } from "../../theme/theme";
import { CloseLeftBtn } from "../AlertMsg/styled";
import { StyledLoadingContainer } from "../SharedStyled";

const HelpDiv = ({ hideHelpCard }) => {
  const [textToSend, setTextToSend] = useState("");
  const [qAndaArr, setQAndaArr] = useState<any[]>([]);
  const [supportPhonesArr, setSupportPhonesArr] = useState<any[]>([]);
  const [supportPhonesTitle, setSupportPhonesTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    getConfig()
      .then((config: Config) => {
        if (config?.helpPhones?.title) {
          setSupportPhonesTitle(config?.helpPhones?.title);
        }
        if (config?.helpPhones?.value) {
          setSupportPhonesArr(config?.helpPhones?.value);
        }
        if (config?.helpQandA?.value) {
          setQAndaArr(config?.helpQandA?.value);
        }
      })
      .catch((e) => {
        showErrorNotification("אירעה שגיאה בשליפת הנתונים. נסה שנית מאוחר יותר");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  function PhoneDisplay() {
    if (
      supportPhonesArr &&
      supportPhonesArr.length >= 2 &&
      supportPhonesArr[0] &&
      supportPhonesArr[1]
    ) {
      const phoneText = supportPhonesArr[0];
      let dynamicUrl = supportPhonesArr[1];

      // Ensure the URL starts with https://
      if (!/^https?:\/\//i.test(dynamicUrl)) {
        dynamicUrl = `https://${dynamicUrl}`;
      }

      const parts = phoneText.split("קישור");

      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1">
            {parts[0]}
            <Link href={dynamicUrl} target="_blank" rel="noopener noreferrer" underline="hover">
              קישור
            </Link>
            {parts[1]}
          </Typography>
        </Box>
      );
    }
  }

  if (loading) {
    return (
      <StyledLoadingContainer>
        <Loader />
      </StyledLoadingContainer>
    );
  }

  return (
    <ContainerDiv onClick={hideHelpCard}>
      <HelpCardContainer>
        <HelpCard
          onClick={(event) => {
            event.stopPropagation();
          }}>
          <CloseLeftBtn onClick={hideHelpCard} />
          <HelpCardTitle>תמיכה טכנית</HelpCardTitle>
          <Box sx={{ padding: "10px" }}>
            <HelpCardSubTitle>שאלות ותשובות</HelpCardSubTitle>

            <HelpQandAList>
              {qAndaArr.map((item: any, index: number) => {
                const regularLines = item.a.filter(
                  (line: string) => !line.trim().startsWith("*"),
                );
                const bulletLines = item.a.filter((line: string) => line.trim().startsWith("*"));

                return (
                  <QandAListItem
                    $selected={openIndex === index}
                    key={index}
                    onClick={() => toggleIndex(index)}>
                    <HelpQandABox>
                      <QuestionTitle>{item.q}</QuestionTitle>
                      <IconButton onClick={() => toggleIndex(index)} size="small">
                        {openIndex === index ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </HelpQandABox>
                    <Collapse
                      in={openIndex === index}
                      timeout="auto"
                      unmountOnExit
                      sx={{ width: "100%", textAlign: "right" }}>
                      <AnswerBox>
                        {regularLines.map((line: string, lineIndex: number) => (
                          <RegularAnswerText key={`reg-${lineIndex}`}>{line}</RegularAnswerText>
                        ))}

                        {bulletLines.length > 0 && (
                          <ul
                            style={{
                              margin: 0,
                              paddingInlineStart: "20px",
                              listStyleType: "disc",
                              listStylePosition: "outside",
                            }}>
                            {bulletLines.map((line: string, bulletIndex: number) => (
                              <li
                                key={`li-${bulletIndex}`}
                                style={{
                                  color: theme.palette.text.primary,
                                  fontSize: "18px",
                                  lineHeight: "1.6",
                                  paddingLeft: "0.1rem", // indent for wrapped lines
                                  textIndent: "-0.1rem", // pull first line left to align bullet
                                }}>
                                {line.replace(/^\*\s*/, "")}
                              </li>
                            ))}
                          </ul>
                        )}
                      </AnswerBox>
                    </Collapse>
                  </QandAListItem>
                );
              })}
            </HelpQandAList>
            <HelpCardDivider orientation="horizontal" />

            <HelpCardSubTitle>{supportPhonesTitle}</HelpCardSubTitle>
            <List>
              {PhoneDisplay()}
            </List>
          </Box>
        </HelpCard>
      </HelpCardContainer>
    </ContainerDiv>
  );
};

export default HelpDiv;
