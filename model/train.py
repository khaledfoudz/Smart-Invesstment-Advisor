# ===============================
# IMPORT LIBRARIES
# ===============================

import pandas as pd  
# بنستورد مكتبة pandas ونسميها pd
# pandas مسؤولة عن التعامل مع الداتا (جداول – CSV – DataFrame)

import numpy as np  
# بنستورد numpy ونسميها np
# numpy مسؤولة عن العمليات الحسابية والأرقام
# حتى لو مش مستخدمها مباشرة، pandas و xgboost بيعتمدوا عليها

from sklearn.model_selection import train_test_split  
# دالة بتقسم الداتا لـ Train و Test
# مهمة جدًا عشان الموديل ما يختبرش نفسه على نفس الداتا

from sklearn.preprocessing import LabelEncoder  
# أداة بتحول النصوص (Low / High) لأرقام (0 / 1 / 2)
# لأن الموديل مايفهمش نص

from sklearn.metrics import accuracy_score  
# دالة بتحسب دقة الموديل (كام % prediction صح)

from xgboost import XGBClassifier  
# استيراد موديل XGBoost للتصنيف
# ده الموديل الأساسي اللي هيشتغل


# ===============================
# LOAD DATASET
# ===============================

df = pd.read_csv("SMAI_realistic_dataset.csv")  
# بنقرأ ملف CSV من الهارد
# ونحطه في DataFrame اسمه df
# df عبارة عن جدول (صفوف × أعمدة)


# ===============================
# CLEAN NUMERIC COLUMNS
# ===============================

numeric_columns = ["Salary", "Savings", "Investment_Value"]  
# ليستة بالأعمدة اللي المفروض تكون أرقام
# بس غالبًا فيها رموز زي $ أو نص

for col in numeric_columns:  
    # لوب بيلف على كل عمود رقمي واحد واحد

    df[col] = df[col].astype(str)  
    # بنحوّل العمود كله لنص
    # عشان نقدر ننضفه بالـ replace

    df[col] = df[col].str.replace(r"[^\d.]", "", regex=True)  
    # بنشيل أي حاجة مش رقم أو نقطة
    # مثال: "$50,000" → "50000"

    df[col] = pd.to_numeric(df[col], errors="coerce")  
    # بنرجّع العمود تاني لأرقام
    # أي قيمة بايظة تتحول NaN

df[numeric_columns] = df[numeric_columns].fillna(
    df[numeric_columns].mean()
)  
# أي NaN في الأعمدة الرقمية نملأه بمتوسط العمود
# لأن XGBoost ما بيحبش القيم الفاضية


# ===============================
# ENCODING CATEGORICAL FEATURES
# ===============================

categorical_columns = [
    "Risk_Tolerance",
    "Investment_Horizon",
    "Goal"
]  
# الأعمدة اللي فيها نصوص (categorical)
# لازم تتحول لأرقام

encoders = {}  
# Dictionary فاضي
# هنخزن فيه الـ LabelEncoder لكل عمود
# عشان نستخدم نفس التحويل بعدين مع user input

for col in categorical_columns:  
    # لوب على كل عمود نصي

    le = LabelEncoder()  
    # بنعمل Encoder جديد للعمود ده

    df[col] = le.fit_transform(df[col])  
    # fit: يتعلم القيم المختلفة
    # transform: يحولها لأرقام
    # مثال: Low → 0 , Medium → 1 , High → 2

    encoders[col] = le  
    # بنخزن الـ encoder ده في القاموس
    # عشان نستخدمه بعدين بنفس الترتيب


# ===============================
# ENCODING TARGET (RECOMMENDATION)
# ===============================

target_encoder = LabelEncoder()  
# Encoder خاص بالـ target (Recommendation)
# منفصل عن الـ features

df["Recommendation"] = target_encoder.fit_transform(
    df["Recommendation"]
)  
# بنحوّل التوصية لأرقام
# لأن الموديل لازم يشتغل بأرقام


# ===============================
# FEATURES & TARGET
# ===============================

X = df.drop(["Recommendation", "Goal"], axis=1)  
# X = كل الأعمدة ما عدا:
# - Recommendation (اللي هنpredicته)
# - Goal (عشان نمنع Data Leakage)

y = df["Recommendation"]  
# y = العمود اللي الموديل هيتعلم يتوقعه


# ===============================
# TRAIN / TEST SPLIT
# ===============================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,  
    # 20% من الداتا Test
    # 80% Train

    random_state=42,  
    # رقم ثابت عشان نفس التقسيم يتكرر كل مرة

    stratify=y  
    # مهم جدًا
    # بيضمن إن كل Class يظهر بنفس النسبة في Train و Test
)


# ===============================
# BUILD XGBOOST MODEL
# ===============================

model = XGBClassifier(
    n_estimators=200,  
    # عدد الأشجار (Trees)
    # كل ما يزيد = موديل أقوى (لحد حد معين)

    max_depth=5,  
    # أقصى عمق لكل Tree
    # عمق كبير = حفظ
    # عمق صغير = ضعف

    learning_rate=0.1,  
    # تأثير كل Tree
    # صغير = تعلم تدريجي أحسن

    subsample=0.8,  
    # كل Tree تشوف 80% من الصفوف
    # يقلل Overfitting

    colsample_bytree=0.8,  
    # كل Tree تشوف 80% من الأعمدة
    # وده سبب إن Tree ممكن متشوفش Salary

    objective="multi:softmax",  
    # تصنيف متعدد
    # يرجع Class مباشر مش Probability

    num_class=len(y.unique()),  
    # عدد الكلاسات المختلفة في Recommendation

    random_state=42  
    # تثبيت العشوائية
)


# ===============================
# TRAIN MODEL
# ===============================

model.fit(X_train, y_train)  
# هنا الموديل:
# - يبني 200 Tree
# - واحدة ورا واحدة
# - كل Tree تصلّح أخطاء اللي قبلها

# ===============================
# SAVE MODEL & ENCODERS
# ===============================

import joblib
joblib.dump(model,          "model.pkl")
joblib.dump(encoders,       "encoders.pkl")
joblib.dump(target_encoder, "target_encoder.pkl")
print("✅ Model and encoders saved!")

# ===============================
# EVALUATE MODEL
# ===============================

y_pred = model.predict(X_test)  
# الموديل يتوقع على داتا ما شافهاش

accuracy = accuracy_score(y_test, y_pred)  
# نحسب نسبة التوقعات الصح

print("Model Accuracy:", accuracy)  
# نطبع دقة الموديل


# ===============================
# USER INPUT SECTION
# ===============================

print("\n--- Enter your investment data ---")  
# رسالة للمستخدم

age = float(input("Enter your age: "))  
# ناخد السن من المستخدم ونحوّله float

salary = float(input("Enter your salary: "))  
# المرتب

savings = float(input("Enter your savings: "))  
# المدخرات

investment_value = float(input("Enter investment value: "))  
# قيمة الاستثمار

risk_input = input("Risk tolerance (Low / Medium / High): ")  
# مستوى المخاطرة كنص

horizon_input = input("Investment horizon (Short / Medium / Long): ")  
# مدة الاستثمار كنص


# ===============================
# ENCODE USER INPUTS
# ===============================

risk_encoded = encoders["Risk_Tolerance"].transform([risk_input])[0]  
# نحول النص لرقم
# باستخدام نفس encoder اللي اتدرّب

horizon_encoded = encoders["Investment_Horizon"].transform([horizon_input])[0]  
# نفس الكلام لمدّة الاستثمار


# ===============================
# CREATE USER DATAFRAME
# ===============================

user_data = pd.DataFrame([{
    "Age": age,
    "Salary": salary,
    "Savings": savings,
    "Investment_Value": investment_value,
    "Risk_Tolerance": risk_encoded,
    "Investment_Horizon": horizon_encoded
}])  
# بنحوّل بيانات المستخدم لـ DataFrame
# لأن XGBoost ما يقبلش dict أو list

user_data = user_data[model.feature_names_in_]  
# نرتب الأعمدة بنفس ترتيب التدريب
# دي خطوة خطيرة جدًا لو اتشالت الموديل يخبّط


# ===============================
# MAKE PREDICTION
# ===============================

prediction = model.predict(user_data)[0]  
# الموديل يطلع رقم الكلاس المتوقع

final_Recommendation = target_encoder.inverse_transform(
    [prediction]
)[0]  
# نرجّع الرقم لنص مفهوم (Stocks / Bonds / ...)

print("\n✅ Recommended Investment:")  
# رسالة

print(final_Recommendation)  
# نطبع التوصية النهائية