import React, { type ChangeEvent, type FunctionComponent,type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import './FormInput.scss';
import { Input, Form, Typography } from "antd";
import type { InputStatus } from "antd/es/_util/statusUtils";
import { CloseOutlined } from "@ant-design/icons";
import type { Rule } from "antd/es/form";

type FormItemInputProps = {
  formItemName?: any;
  label?: string; 
  labelStyle?: any;
  prefixIcon?: ReactNode | string;
  afterPrefixIcon?: ReactNode;
  placeholder?: string;
  suffix?: ReactNode | string;
  readOnly?: boolean;
  value?: string | string[] | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  passwordInput?: boolean;
  onKeyPress?: (e: KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  status?: InputStatus;
  type?: string;
  required?: boolean;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  className?:string
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  prefix?: React.ReactNode;
  allowClear?: boolean | {clearIcon?: ReactNode} | undefined
  maxLength?: number; // Thêm thuộc tính maxLength
  valueRender?: any;
  fromRender?: boolean;
  filterFKState?: any;
  filterFK?: any;
  filterFKDefault?: any;
  src?: any;
  allowOnlyNumbers?: boolean;
  min?: number;
  max?: number;
  rules?: Rule[];
  defaultValue?:any;
};

const FormItemInput: FunctionComponent<FormItemInputProps> = ({
  formItemName,
  label, // Nhận label từ props
  labelStyle,
  prefixIcon,
  afterPrefixIcon,
  placeholder,
  value,
  onChange,
  onKeyPress,
  disabled,
  readOnly,
  suffix,
  style = { marginBottom: "0px" },
  status,
  required = false,
  onBlur,
  onFocus,
  onKeyUp,
  onKeyDown,
  autoFocus,
  className,
  onPaste,
  prefix,
  allowClear,
  maxLength,
  valueRender,
  fromRender,
  filterFKState,
  filterFK,
  filterFKDefault,
  src,
  type,
  allowOnlyNumbers,
  min,
  max,
  rules,
  defaultValue,
  ...rest
}) => {

  const inputRef = useRef<any>(null);
  useEffect(() => {
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
    }
  }, [autoFocus]);

  const handleChangeBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const trimmedValue = e.target.value.trim();
    if (onChange) {
      onChange({
        ...e,
        target: { ...e.target, value: trimmedValue },
      });
    }

    if(onBlur){
      onBlur(e)
    }
  };

  useEffect(() => {
    //FK => loc param cua src hoac data filter
    if (filterFK) {
      if (src) {
        if (Array.isArray(filterFK)) {
          filterFK.forEach((fk: any, idx: number) => {
            if (filterFKState && filterFKState?.[idx] && Array.isArray(filterFKState?.[idx])) {
              const lstValue = filterFKState?.[idx]?.map((x: any) => `${x.label}=${x.value ?? x ?? ''}`).join(',');
              const lstValueLabel = filterFKState?.[idx]?.map((x: any) => `${x.label}=${x.value ?? x ?? ''}`).join(',');
              src = src?.replaceAll("{" + fk?.replace('filter_', '') + "}", lstValue);
              src = src?.replaceAll("{" + fk?.replace('filter_', '') + "_label}", lstValueLabel);
            }
            else {
              src = src?.replaceAll("{" + fk?.replace('filter_', '') + "}", `${filterFKState?.[idx]?.value ?? (filterFKDefault || '')}`);
              src = src?.replaceAll("{" + fk?.replace('filter_', '') + "_label}", `${filterFKState?.[idx]?.label ?? (filterFKDefault || '')}`);
            }
          });
        }
        else {
          if (filterFKState && Array.isArray(filterFKState)) {
            const lstValue = filterFKState?.map((x: any) => `${x.label}=${x.value ?? x ?? ''}`).join(',');
            const lstValueLabel = filterFKState?.map((x: any) => `${x.label}=${x.value ?? x ?? ''}`).join(',');
            src = src?.replaceAll("{" + filterFK?.replace('filter_', '') + "}", lstValue);
            src = src?.replaceAll("{" + filterFK?.replace('filter_', '') + "_label}", lstValueLabel);
          }
          else {
            src = src?.replaceAll("{" + filterFK?.replace('filter_', '') + "}", `${filterFKState?.value ?? (filterFKDefault || '')}`);
            src = src?.replaceAll("{" + filterFK?.replace('filter_', '') + "_label}", `${filterFKState?.label ?? (filterFKDefault || '')}`);
          }
        }
        const event = {
          target: { value: src },
        } as ChangeEvent<HTMLInputElement>;
        onChange?.(event);
      }
      else {

      }
    }
  }, [filterFKState])

  return (
    <Form.Item
      name={formItemName}
      className="form-item form-item-custom"
      required={required} 
      rules={
        required
          ? [
              { required: true, message: `Vui lòng nhập ${label}` },
              ...rules ?? [],
            ]
          : rules
      }
    >
      <Typography.Text style={labelStyle || { fontSize: "16px" }}>{label}{required === true ? <span className="required-star" style={{ color: 'red', position: 'relative' }}> *</span> : ''}</Typography.Text>
      <Input
        prefix={prefix}
        onBlur={handleChangeBlur}
        onFocus={onFocus}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        disabled={disabled}
        addonBefore={prefixIcon}
        addonAfter={afterPrefixIcon}
        value={value}
        type={type}
        min={(type == "number") ? min : undefined}
        max={(type == "number") ? max : undefined}
        style={style}
        readOnly={readOnly}
        suffix={suffix}
        status={status}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        allowClear={allowClear ?? {
          clearIcon:<CloseOutlined className="clearContentIcon2" />
        }}
        required={required}
        autoFocus={autoFocus}
        ref={inputRef}
        onPaste={onPaste}
        maxLength={maxLength}
        defaultValue={defaultValue}
        {...rest}
        className={`form-input ${className ?? ''}`}
        onInput={(e) => {
          const target = e.target as HTMLInputElement;
          if (allowOnlyNumbers) {
            target.value = target.value.replace(/[^\d]/g, ""); 
          } 
        }}
      />
    </Form.Item>
  );
};

export default FormItemInput;
