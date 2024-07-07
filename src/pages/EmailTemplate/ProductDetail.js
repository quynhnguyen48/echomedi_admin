import classNames from "classnames"
import dayjs from "dayjs"
import React, { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getStrapiMedia } from "utils/media"
import sumBy from "lodash/sumBy"
import { toast } from "react-toastify"
import { formatPrice } from "utils/number";
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import Select from "components/Select"

import Button from "components/Button"
import DataItem from "components/DataItem"
import Icon from "components/Icon"
import Tag from "components/Tag"
import { BRAND_STATUS } from "constants/Brand"
import ProductDescription from "./components/ProductDescription"
import ProductImages from "./components/ProductImages"
import ProductInventory from "./components/ProductInventory"
import ProductVariants from "./components/ProductVariants"
import PrescriptionModal from "./PrescriptionModal";
import Input from "components/Input";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup"
import * as yup from "yup"
import {
  updateServiceBundle
} from "services/api/serviceBundle";
import { updateEmailTemplate, sendTestEmail, sendEmails } from "services/api/emailTemplates";

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const ProductDetail = ({ data, onTogglePublish, onUpdateProduct, patientSource }) => {
  const navigate = useNavigate()
  const [openProductDescriptionDrawer, setOpenProductDescriptionDrawer] = useState(false)
  const [openProductImagesDrawer, setOpenProductImagesDrawer] = useState(false)
  const [openProductVariantsDrawer, setOpenProductVariantsDrawer] = useState(false)
  const [openProductInventoryDrawer, setOpenProductInventoryDrawer] = useState(false)
  const [visiblePrescriptionModal, setVisiblePrescriptionModal] = useState(false);
  const validationSchema = yup.object({});
  const [label, setLabel] = useState("");
  const [sourceId, setSourceId] = useState(0);
  const [email, setEmail] = useState('');

  const emailEditorRef = React.createRef();


  useEffect(() => {
    setLabel(data?.label)
    const unlayer = emailEditorRef.current?.editor;
    if (data?.design) {
      unlayer?.loadDesign(data ? data?.design : {});
    } else {
      unlayer?.loadBlank();
    }
  }, [data]);

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((a) => {
      const { design, html } = a;

      let uData = { ...data };
      uData.article = html;
      uData.design = design;

      updateEmailTemplate(data.id, uData);
    });
  };

  const toSendTestEmail = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((a) => {
      const { design, html } = a;

      let uData = { ...data };
      uData.article = html;
      uData.design = design;

      sendTestEmail({ id: data.id, email: email });
    });
  };

  const toSendEmails = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((a) => {
      const { design, html } = a;

      let uData = { ...data };
      uData.article = html;
      uData.design = design;

      sendEmails({ id: data.id, sourceId: sourceId });
    });
  };

  const onReady: EmailEditorProps['onReady'] = (unlayer) => {
    // editor is ready
    // you can load your template here;
    // the design json can be obtained by calling
    unlayer.loadDesign(data.design);

    // const templateJson = { DESIGN JSON GOES HERE };
    // unlayer.loadDesign(templateJson);
  };


  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {},
  })

  return (
    <div className="my-10 w-full mb-4">
      <div className="mt-4">
        <EmailEditor ref={emailEditorRef} onReady={onReady} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Button onClick={e => {
          exportHtml();
        }}>
          Save
        </Button>
        {/* <span></span> */}
        <Controller
          name="code"
          label="Tên"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label={'Email'}
              onChange={e => setEmail(e.target.value)}
              value={email}
              name="code"
            />
          )}
        />
        <Button onClick={e => {
          toSendTestEmail();
        }}>
          Send test email
        </Button>
        <Controller
          name="patient_source"
          control={control}
          render={({ field: { onChange, value, ref } }) => (
            <Select
              placeholder="Chọn nguồn"
              label="Nguồn"
              name="patient_source"
              options={patientSource}
              value={value && patientSource?.find((s) => s.id === sourceId)}
              onChange={e => {
                console.log('eee', e)
                setSourceId(e.id);
              }}
              errors={errors?.category?.message}
            />
          )}
        />
        <Button onClick={e => {
          toSendEmails();
        }}>
          Send emails
        </Button>
        <span></span>
        <Controller
          name="code"
          label="Tên"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label={'Tên'}
              onChange={e => setLabel(e.target.value)}
              value={label}
              name="code"
            />
          )}
        />
      </div>
    </div>
  )
}

export default ProductDetail
