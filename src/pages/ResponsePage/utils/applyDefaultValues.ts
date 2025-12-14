import { Form, ResponseFieldValue } from "utils/interfaces";

const applyDefaultValues = (responseData: ResponseFieldValue[], form: Form) => {
  return responseData.map((item) => {
    return {
      ...item,
      value: item.value,
    };
  });
};

export default applyDefaultValues;