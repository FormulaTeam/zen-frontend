import { AffectedTargetsDescriptionText, AffectedTargetsWarning } from "./styled";

const AffectedTargetsDescription: React.FC = () => {
  return (
    <>
      <AffectedTargetsDescriptionText variant="body2">
        בחר את השדות והמקטעים <b>שיופיעו</b> כאשר התנאים יתקיימו
      </AffectedTargetsDescriptionText>
      <AffectedTargetsWarning variant="body2">
        במידה ושדה או מקטע מושפע מתנאים אחרים, הוא יוצג רק אם כל התנאים מתקיימים -
        <br />
        יש לוודא שהתנאים לא מתנגשים כדי להימנע ממצבים בהם הם לא יוצגו.
        <br /> <br />
        יודגש, לא ניתן להגדיר התניות על שדות חובה או על המקטעים שמכילים שדות חובה בטופס
      </AffectedTargetsWarning>
    </>
  );
};
export default AffectedTargetsDescription;
