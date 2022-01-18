import { useEffect } from "react";
import Modal from "@src/components/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import { default as Content } from "./ConditionModalContent";
import { EMPTY_STATE } from "./Settings";
import { ConstructionOutlined } from "@mui/icons-material";
import { mdiConsoleLine } from "@mdi/js";

export default function ConditionModal({
  modal,
  setModal,
  conditions,
  setConditions,
}) {
  const handleClose = () => setModal(EMPTY_STATE);

  //This is fine
  const handleSave = () => {
    let _conditions = [...conditions];
    _conditions[modal.index] = modal.condition;
    setConditions(_conditions);
    setModal(EMPTY_STATE);
  };
  const handleAdd = () => {
    function setConditionHack(type, condition) {
      let rCondition = condition;
      if (type === "undefined") rCondition = { ...condition, value: undefined };
      if (type === "boolean" && typeof condition.value === "object") {
        //Again 'rowy's multiselect does not accept default value'
        rCondition = { ...condition, value: false };
      }
      return rCondition;
    }
    const modalCondition = setConditionHack(
      modal.condition.type,
      modal.condition
    );
    const noConditions = Boolean(conditions?.length === 0 || !conditions);
    const arr = noConditions
      ? [modalCondition]
      : [...conditions, modalCondition];
    setConditions(arr);
    setModal(EMPTY_STATE);
  };
  const handleRemove = () => {
    const _newConditions = conditions.filter(
      (c, index) => index !== modal.index
    );
    setConditions(_newConditions);
    setModal(EMPTY_STATE);
  };
  const handleUpdate = (key: string) => (value) => {
    setModal({ ...modal, condition: { ...modal.condition, [key]: value } });
  };
  const primaryAction = (index) => {
    return index === null
      ? {
          children: "Add condition",
          onClick: () => handleAdd(),
          disabled: false,
        }
      : {
          children: "Save changes",
          onClick: () => handleSave(),
          disabled: false,
        };
  };
  const secondaryAction = (index) => {
    return index === null
      ? {
          children: "Cancel",
          onClick: () => setModal(EMPTY_STATE),
        }
      : {
          startIcon: <DeleteIcon />,
          children: "Remove condition",
          onClick: () => handleRemove(),
        };
  };

  useEffect(() => {
    handleUpdate("operator")(modal.condition.operator ?? "==");
  }, [modal.condition.type]);

  return (
    <Modal
      open={modal.isOpen}
      title={`${modal.index ? "Edit" : "Add"} condition`}
      maxWidth={"xs"}
      onClose={handleClose}
      actions={{
        primary: primaryAction(modal.index),
        secondary: secondaryAction(modal.index),
      }}
      children={
        <Content condition={modal.condition} handleUpdate={handleUpdate} />
      }
    />
  );
}
