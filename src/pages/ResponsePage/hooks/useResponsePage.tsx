import { useEffect } from "react";
import { getFormById } from "api/formsApi";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useResponseStateContext } from "../context/ResponseStateProvider";
import {
  FieldTypeIds,
  FormField,
  NewResponse,
  ResponseFieldValue,
  SearchResponsesFilter,
} from "utils/interfaces";
import {
  getResponseWithFlatFields,
  searchResponses,
  useCreateResponse,
  useUpdateResponse,
} from "api/responsesApi";
import { getUserName } from "utils/utils";
import { useAuth } from "contexts/AuthContext";

interface UseResponsePageProps {
  viewMode: boolean;
  copyMode: boolean;
}

const useResponsePage = ({ viewMode, copyMode }: UseResponsePageProps) => {
  const { user } = useAuth();
  const { formId, id: responseId } = useParams();
  const { form, setForm, setConnectedForms, setResponseData } = useResponseStateContext();
  const {
    mutateAsync: mutateCreateResponseAsync,
    isSuccess: isCreateResponseSuccess,
    isPending: isCreateResponsePending,
  } = useCreateResponse();
  const {
    mutateAsync: mutateUpdateResponseAsync,
    isSuccess: isUpdateResponseSuccess,
    isPending: isUpdateResponsePending,
  } = useUpdateResponse(form?.id || 0, responseId ? Number(responseId) : 0);

  const location = useLocation();
  const navigate = useNavigate();

  const userName = getUserName(user?.firstName || "", user?.lastName || "");

  useEffect(() => {
    if (formId) {
      getFormById(Number(formId)).then((form) => {
        if (form && !viewMode && !copyMode) {
          setForm({ ...form, name: "יצירת תגובה - " + form.name });
        }
      });
    }
    if (responseId) {
      const filter: SearchResponsesFilter = {
        form_id: Number(formId),
        searchFilters: [{ searchText: Number(responseId), searchField: "id" }],
      };
      searchResponses(filter).then((res: any) => {
        if (res) {
          //console.log("res.responses", res.responses[0].data);
          setResponseData(res.responses[0].data);
          // if (copyMode) {
          //   const copyResponse = res.responses[0];
          //   copyResponse.id = null;
          //   setResponseData(copyResponse);
          // } else {
          //   setResponseData(res.responses[0]);
          // }
        }
      });
    }
  }, [formId]);

  useEffect(() => {
    const connectedForms = form?.fields?.filter(
      (field: FormField) => field.typeId === FieldTypeIds.form,
    );
    console.log("connectedForms", connectedForms);
    connectedForms && setConnectedForms(connectedForms);
  }, [form]);

  const onBack = () => {
    if (location.state?.parentFormId) {
      navigate(`/responses/${location.state.parentFormId}`, {});
    } else {
      form && navigate(`/responses/${form.id}`);
    }
  };

  const onSaveAndClose = async (values?: any) => {
    console.log("values", values);
    // if (values?.parentForm && values?.childForm) {
    //   const parentResponse: NewResponse = {
    //     form_id: values.parentForm.id,
    //     created_by_name: userName,
    //     created_by: user?.upn?.toLowerCase() || "",
    //     edited_by: user?.upn?.toLowerCase() || "",
    //     edited_by_name: userName,
    //     data: [],
    //     parentResponse: values.childForm.id.toString(),
    //   };
    //   await mutateCreateResponseAsync(parentResponse);
    // }

    // if (!form || !form.id || !user) return;
    // const dataArr: ResponseFieldValue[] = [];
    // for (const [key, value] of Object.entries(values)) {
    //   dataArr.push({
    //     uniqueId: key,
    //     value,
    //   });
    // }
    // const fieldsNameValueObj = getResponseWithFlatFields(dataArr, form?.fields || []);
    // if (responseId) {
    //   const editedResponse = {
    //     id: responseId ? Number(responseId) : 0,
    //     uniqueId: responseId ? Number(responseId) : 0,
    //     form_id: form?.id,
    //     edited_by: user.upn?.toLowerCase(),
    //     edited_by_name: userName,
    //     data: dataArr,
    //     parentResponse: "",
    //     ...fieldsNameValueObj,
    //   };
    //   await mutateUpdateResponseAsync(editedResponse);
    // } else {
    //   const newResponse: NewResponse = {
    //     form_id: form?.id,
    //     created_by_name: userName,
    //     created_by: user?.upn?.toLowerCase() || "",
    //     edited_by: user?.upn?.toLowerCase() || "",
    //     edited_by_name: userName,
    //     data: dataArr,
    //     parentResponse: "",
    //     ...fieldsNameValueObj,
    //   };
    //   await mutateCreateResponseAsync(newResponse);
    // }
  };

  useEffect(() => {
    if (isCreateResponseSuccess || isUpdateResponseSuccess) {
      navigate(`/responses/${form?.id}`);
    }
  }, [isCreateResponseSuccess, isUpdateResponseSuccess]);

  return {
    permissionTypes: [],
    onEdit: () => navigate(`/response/edit/${formId}/${responseId}`),
    onBack,
    onSaveAndClose,
    saveDisabled: false,
    form,
    isLoading: isCreateResponsePending || isUpdateResponsePending,
  };
};

export default useResponsePage;
