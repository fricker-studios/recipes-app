from typing import Optional
from pydantic import BaseModel


class AbridgedFoodNutrient(BaseModel):
    name: Optional[str] = None
    unitName: Optional[str] = None
    number: Optional[str] = None
    amount: Optional[float] = None
    derivationCode: Optional[str] = None
    derivationDescription: Optional[str] = None


class Nutrient(BaseModel):
    id: Optional[int] = None
    number: Optional[str] = None
    name: Optional[str] = None
    rank: Optional[int] = None
    unitName: Optional[str] = None


class FoodNutrientSource(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    description: Optional[str] = None


class FoodNutrientDerivation(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    description: Optional[str] = None
    foodNutrientSource: Optional[FoodNutrientSource] = None


class NutrientAcquisitionDetails(BaseModel):
    sampleUnitId: Optional[int] = None
    purchaseDate: Optional[str] = None
    storeCity: Optional[str] = None
    storeState: Optional[str] = None


class NutrientAnalysisDetails(BaseModel):
    subSampleId: Optional[int] = None
    amount: Optional[float] = None
    nutrientId: Optional[int] = None
    labMethodDescription: Optional[str] = None
    labMethodOriginalDescription: Optional[str] = None
    labMethodLink: Optional[str] = None
    labMethodTechnique: Optional[str] = None
    nutrientAcquisitionDetails: Optional[list[NutrientAcquisitionDetails]] = []


class FoodNutrient(BaseModel):
    id: Optional[int] = None
    amount: Optional[float] = None
    dataPoints: Optional[int] = None
    min: Optional[float] = None
    max: Optional[float] = None
    median: Optional[float] = None
    type: Optional[str] = None
    nutrient: Optional[Nutrient] = None
    foodNutrientDerivation: Optional[FoodNutrientDerivation] = None
    nutrientAnalysisDetails: Optional[list[NutrientAnalysisDetails]] = []


class FdcFoodAttributeType(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None


class FoodAttribute(BaseModel):
    id: Optional[int] = None
    sequenceNumber: Optional[int] = None
    value: Optional[str] = None
    FoodAttributeType: Optional[FdcFoodAttributeType] = None


class LabelNutrient(BaseModel):
    value: Optional[float] = None


class LabelNutrients(BaseModel):
    fat: Optional[LabelNutrient] = None
    saturatedFat: Optional[LabelNutrient] = None
    transFat: Optional[LabelNutrient] = None
    cholesterol: Optional[LabelNutrient] = None
    sodium: Optional[LabelNutrient] = None
    carbohydrates: Optional[LabelNutrient] = None
    fiber: Optional[LabelNutrient] = None
    sugars: Optional[LabelNutrient] = None
    protein: Optional[LabelNutrient] = None
    calcium: Optional[LabelNutrient] = None
    iron: Optional[LabelNutrient] = None
    potassium: Optional[LabelNutrient] = None
    calories: Optional[LabelNutrient] = None


class FoodUpdateLog(BaseModel):
    fdcId: Optional[int] = None
    availableDate: Optional[str] = None
    brandOwner: Optional[str] = None
    dataSource: Optional[str] = None
    dataType: Optional[str] = None
    description: Optional[str] = None
    foodClass: Optional[str] = None
    gtinUpc: Optional[str] = None
    householdServingFullText: Optional[str] = None
    ingredients: Optional[str] = None
    modifiedDate: Optional[str] = None
    publicationDate: Optional[str] = None
    servingSize: Optional[int] = None
    servingSizeUnit: Optional[str] = None
    brandedFoodCategory: Optional[str] = None
    changes: Optional[str] = None
    foodAttributes: Optional[list[FoodAttribute]] = []


class FoodCategory(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    description: Optional[str] = None


class FoodComponent(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    dataPoints: Optional[int] = None
    gramWeight: Optional[float] = None
    isRefuse: Optional[bool] = None
    minYearAcquired: Optional[int] = None
    percentWeight: Optional[float] = None


class MeasureUnit(BaseModel):
    id: Optional[int] = None
    abbreviation: Optional[str] = None
    name: Optional[str] = None


class FoodPortion(BaseModel):
    id: Optional[int] = None
    amount: Optional[float] = None
    dataPoints: Optional[int] = None
    gramWeight: Optional[float] = None
    minYearAcquired: Optional[int] = None
    modifier: Optional[str] = None
    portionDescription: Optional[str] = None
    sequenceNumber: Optional[int] = None
    measureUnit: Optional[MeasureUnit] = None


class SampleFoodItem(BaseModel):
    fdcId: int
    dataType: Optional[str] = None
    description: str
    foodClass: Optional[str] = None
    publicationDate: Optional[str] = None
    foodAttributes: Optional[list[FoodCategory]] = []


class InputFoodFoundation(BaseModel):
    id: Optional[int] = None
    foodDescription: Optional[str] = None
    inputFood: Optional[SampleFoodItem] = None


class NutrientConversionFactor(BaseModel):
    id: Optional[int] = None
    type: Optional[str] = None
    value: Optional[float] = None
    name: Optional[str] = None
    proteinValue: Optional[float] = None
    fatValue: Optional[float] = None
    carbohydrateValue: Optional[float] = None


class WweiaFoodCategory(BaseModel):
    wweiaFoodCategoryCode: Optional[int] = None
    wweiaFoodCategoryDescription: Optional[str] = None


class SurveyInputFood(BaseModel):
    fdcId: int
    dataType: Optional[str] = None
    description: str
    endDate: Optional[str] = None
    foodClass: Optional[str] = None
    foodCode: Optional[str] = None
    publicationDate: Optional[str] = None
    startDate: Optional[str] = None
    foodAttributes: Optional[list[FoodAttribute]] = []
    foodPortions: Optional[list[FoodPortion]] = []
    inputFoods: Optional[list["InputFoodSurvey"]] = []
    wweiaFoodCategory: Optional[WweiaFoodCategory] = None


class RetentionFactor(BaseModel):
    id: Optional[int] = None
    code: Optional[int] = None
    description: Optional[str] = None


class InputFoodSurvey(BaseModel):
    id: Optional[int] = None
    amount: Optional[float] = None
    foodDescription: Optional[str] = None
    ingredientCode: Optional[int] = None
    ingredientDescription: Optional[str] = None
    ingredientWeight: Optional[float] = None
    portionCode: Optional[str] = None
    portionDescription: Optional[str] = None
    sequenceNumber: Optional[int] = None
    surveyFlag: Optional[int] = None
    unit: Optional[str] = None
    inputFood: Optional[SurveyInputFood] = None
    retentionFactor: Optional[RetentionFactor] = None


# Basic Food Item Models
class AbridgedFoodItem(BaseModel):
    dataType: str
    description: str
    fdcId: int
    foodNutrients: list[AbridgedFoodNutrient]
    publicationDate: Optional[str]  # e.g., "2024-10-31"
    brandOwner: Optional[str] = None  # only applies to Branded Foods
    gtinUpc: Optional[str] = None  # only applies to Branded Foods
    ndbNumber: Optional[int] = (
        None  # only applies to Foundation Foods and SRLegacy Foods
    )
    foodCode: Optional[str] = None  # only applies to Survey Foods

    @classmethod
    def create_from_dict(cls, data: dict) -> "AbridgedFoodItem":
        return cls.model_validate(data)


class BrandedFoodItem(BaseModel):
    fdcId: int
    availableDate: Optional[str] = None
    brandOwner: Optional[str] = None
    dataSource: Optional[str] = None
    dataType: str
    description: str
    foodClass: Optional[str] = None
    gtinUpc: Optional[str] = None
    householdServingFullText: Optional[str] = None
    ingredients: Optional[str] = None
    modifiedDate: Optional[str] = None
    publicationDate: Optional[str] = None
    servingSize: Optional[int] = None
    servingSizeUnit: Optional[str] = None
    preparationStateCode: Optional[str] = None
    brandedFoodCategory: Optional[str] = None
    tradeChannel: list[str] = []
    gpcClassCode: Optional[int] = None
    foodNutrients: Optional[list[FoodNutrient]] = []
    foodUpdateLog: Optional[list[FoodUpdateLog]] = []
    labelNutrients: Optional[LabelNutrients] = None


class FoundationFoodItem(BaseModel):
    fdcId: int
    dataType: str
    description: str
    foodClass: Optional[str] = None
    footNote: Optional[str] = None
    isHistoricalReference: Optional[bool] = None
    ndbNumber: Optional[int] = None
    publicationDate: Optional[str] = None
    scientificName: Optional[str] = None
    foodCategory: Optional[FoodCategory] = None
    foodComponents: Optional[list[FoodComponent]] = []
    foodNutrients: Optional[list[FoodNutrient]] = []
    foodPortions: Optional[list[FoodPortion]] = []
    inputFoods: Optional[list[InputFoodFoundation]] = []
    nutrientConversionFactors: Optional[list[NutrientConversionFactor]] = []


class SRLegacyFoodItem(BaseModel):
    fdcId: int
    dataType: str
    description: str
    foodClass: Optional[str] = None
    isHistoricalReference: Optional[bool] = None
    ndbNumber: Optional[int] = None
    publicationDate: Optional[str] = None
    scientificName: Optional[str] = None
    foodCategory: Optional[FoodCategory] = None
    foodNutrients: Optional[list[FoodNutrient]] = []
    nutrientConversionFactors: Optional[list[NutrientConversionFactor]] = []


class SurveyFoodItem(BaseModel):
    fdcId: int
    dataType: Optional[str] = None
    description: str
    endDate: Optional[str] = None
    foodClass: Optional[str] = None
    foodCode: Optional[str] = None
    publicationDate: Optional[str] = None
    startDate: Optional[str] = None
    foodAttributes: Optional[list[FoodAttribute]] = []
    foodPortions: Optional[list[FoodPortion]] = []
    inputFoods: Optional[list[InputFoodSurvey]] = []
    wweiaFoodCategory: Optional[WweiaFoodCategory] = None
