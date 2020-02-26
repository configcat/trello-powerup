export interface IProduct {
    productId: string;
    name: string;
}

export interface IConfig {
    configId: string;
    name: string;
}

export interface IEnvironment {
    environmentId: string;
    name: string;
}

export enum SettingType {
    Boolean = 0,
    String = 1,
    Int = 2,
    Double = 3,
}

export interface ISetting {
    settingId: number;
    key: string;
    name: string;
    hint: string;
    settingType: SettingType;
}

export enum RolloutRuleComparator {
    IsOneOf = 0,
    IsNotOneOf = 1,
    Contains = 2,
    DoesNotContain = 3,
    SemVerIsOneOf = 4,
    SemVerIsNotOneOf = 5,
    SemVerLess = 6,
    SemVerLessOrEquals = 7,
    SemVerGreater = 8,
    SemVerGreaterOrEquals = 9,
    NumberEquals = 10,
    NumberDoesNotEqual = 11,
    NumberLess = 12,
    NumberLessOrEquals = 13,
    NumberGreater = 14,
    NumberGreaterOrEquals = 15,
    SensitiveIsOneOf = 16,
    SensitiveIsNotOneOf = 17
}

export interface IRolloutRule {
    comparisonAttribute: string;
    comparator: RolloutRuleComparator;
    comparisonValue: string;
    value: any;
}

export interface IPercentageRule {
    percentage: number;
    value: any;
}

export interface ISettingValue {
    setting: ISetting;
    environment: IEnvironment;
    value: any;
}
