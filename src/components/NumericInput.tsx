import * as React from "react";

import { autobind } from "core-decorators";

import Keys from "@/keys";

import { NumberPrecision, clamp, isFloatingPoint } from "@/math";

import Input from "@/components/Input";

export interface NumericInputProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  precision?: NumberPrecision;
  onCommit(value: number): void;
}

type Props = NumericInputProps;
interface State {
  editValue: number | null;
  validationMessage: string | null;
}
export default class NumericInput extends React.Component<Props, State> {
  private _input = React.createRef<HTMLInputElement>();
  constructor(props: Props) {
    super(props);

    this.state = {
      editValue: null,
      validationMessage: null
    };
  }

  render() {
    const { value, minValue, maxValue, precision } = this.props;
    const { editValue } = this.state;

    const currentValue = editValue != null ? editValue : value;

    const step = isFloatingPoint(precision || "int32") ? Math.pow(10, -16) : 1;

    return (
      <Input
        innerRef={this._input}
        type="number"
        min={minValue}
        max={maxValue}
        value={currentValue}
        onChange={this._onValueChange}
        onKeyPress={this._onInputKeyPress}
        onBlur={this._onInputBlur}
        step={step}
      />
    );
  }

  @autobind()
  private _onValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { minValue, maxValue } = this.props;

    const value = e.target.valueAsNumber;
    let validationMessage: string | null = null;

    if (maxValue != null && value >= maxValue) {
      validationMessage = `Value must be less than ${maxValue}`;
    } else if (minValue != null && value <= minValue) {
      validationMessage = `Value must be greater than ${minValue}`;
    }

    e.target.setCustomValidity(validationMessage || "");

    this.setState({
      editValue: value,
      validationMessage
    });
  }

  @autobind()
  private _onInputKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === Keys.Enter) {
      this._commitEdit();
    }
  }

  @autobind()
  private _onInputBlur() {
    this._commitEdit();
  }

  private _commitEdit() {
    const { editValue, validationMessage } = this.state;
    const { precision = "int32", onCommit } = this.props;

    // Reset validation
    if (validationMessage && this._input.current) {
      this._input.current.setCustomValidity("");
    }

    this.setState({
      editValue: null,
      validationMessage: null
    });

    if (!editValue || validationMessage) {
      return;
    }

    const newValue = clamp(precision, editValue);
    if (isNaN(newValue)) {
      return;
    }

    onCommit(newValue);
  }
}
