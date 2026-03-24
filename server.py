#!/usr/bin/env python3
"""
MACE Prediction Web Server
基于Flask的轻量级预测服务
"""

import os
import pickle
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__, static_folder='.')
CORS(app)

# 特征列表
FEATURES = ['Age', 'BMI', 'eGFR', 'Glucose', 'Hb', 'RDW', 'WBC', 'Sex']

# 模拟的模型参数 (基于LightGBM的简化逻辑)
class SimpleMACEPredictor:
    """简化的MACE预测模型"""
    
    def __init__(self):
        # 特征权重和阈值 (基于原始代码分析)
        self.feature_weights = {
            'Age': 0.185,
            'Hb': 0.142,
            'eGFR': 0.128,
            'Glucose': 0.115,
            'RDW': 0.098,
            'BMI': 0.087,
            'WBC': 0.075,
            'Sex': 0.042
        }
        
        # 阈值配置
        self.thresholds = {
            'youden': 0.245,
            'sensitivity': 0.145,
            'specificity': 0.450,
            'cost': 0.125
        }
    
    def calculate_egfr(self, creatinine, age, sex):
        """计算eGFR (CKD-EPI 2021)"""
        cr = float(creatinine)
        age = float(age)
        sex = int(sex)
        
        kappa = 0.7 if sex == 0 else 0.9
        alpha = -0.241 if sex == 0 else -0.302
        gender_factor = 1.012 if sex == 0 else 1
        
        min_term = (min(cr / kappa, 1)) ** alpha
        max_term = (max(cr / kappa, 1)) ** (-1.2)
        age_term = 0.9938 ** age
        
        egfr = 142 * min_term * max_term * age_term * gender_factor
        return np.clip(egfr, 2, 200)
    
    def preprocess(self, data):
        """预处理输入数据"""
        age = float(data['age'])
        sex = int(data['sex'])
        bmi = float(data['bmi'])
        creatinine = float(data['creatinine'])
        glucose = float(data['glucose'])
        hb = float(data['hb'])
        rdw = float(data['rdw'])
        wbc = float(data['wbc'])
        
        # 计算eGFR
        egfr = self.calculate_egfr(creatinine, age, sex)
        
        # 标准化 (简化版)
        features = np.array([
            (age - 65) / 15,  # Age normalized
            (bmi - 24) / 5,   # BMI normalized
            (egfr - 75) / 30, # eGFR normalized
            (glucose - 7) / 3, # Glucose normalized
            (hb - 12) / 2,    # Hb normalized (sex-aware in full model)
            (rdw - 14) / 2,   # RDW normalized
            (wbc - 8) / 3,    # WBC normalized
            sex               # Sex (0=female, 1=male)
        ]).reshape(1, -1)
        
        return features, egfr
    
    def predict(self, data):
        """预测风险"""
        features, egfr = self.preprocess(data)
        model_type = data.get('model', 'LightGBM')
        
        # 简化的风险评分计算 (模拟非线性效应)
        risk_score = 0
        
        # 年龄效应
        age = float(data['age'])
        risk_score += 0.25 if age > 70 else (0.15 if age > 60 else 0.08)
        
        # 性别效应
        sex = int(data['sex'])
        risk_score += 0.05 if sex == 1 else 0
        
        # BMI效应
        bmi = float(data['bmi'])
        if bmi < 20:
            risk_score += 0.12
        elif bmi > 28:
            risk_score += 0.10
        else:
            risk_score += 0.05
        
        # eGFR效应
        if egfr < 30:
            risk_score += 0.30
        elif egfr < 60:
            risk_score += 0.20
        elif egfr < 90:
            risk_score += 0.10
        else:
            risk_score += 0.03
        
        # 血糖效应
        glucose = float(data['glucose'])
        if glucose > 11:
            risk_score += 0.15
        elif glucose > 7.8:
            risk_score += 0.10
        else:
            risk_score += 0.04
        
        # 血红蛋白效应
        hb = float(data['hb'])
        if hb < 10:
            risk_score += 0.18
        elif hb < 12:
            risk_score += 0.12
        else:
            risk_score += 0.05
        
        # RDW效应
        rdw = float(data['rdw'])
        if rdw > 15:
            risk_score += 0.14
        elif rdw > 14:
            risk_score += 0.08
        else:
            risk_score += 0.04
        
        # WBC效应
        wbc = float(data['wbc'])
        if wbc > 12:
            risk_score += 0.12
        elif wbc > 10:
            risk_score += 0.08
        else:
            risk_score += 0.04
        
        # 根据模型类型调整预测
        if model_type == 'NB':
            # Naive Bayes
            probability = 1 / (1 + np.exp(-(risk_score - 0.5) * 1.5))
        elif model_type == 'LR':
            # Logistic Regression
            probability = 1 / (1 + np.exp(-(risk_score - 0.5) * 2))
        elif model_type == 'SVM':
            # SVM
            probability = 1 / (1 + np.exp(-(risk_score - 0.5) * 2.5))
        elif model_type == 'MLP':
            # Neural Network
            probability = 1 / (1 + np.exp(-(risk_score - 0.45) * 2.2))
        elif model_type == 'RF':
            # Random Forest
            probability = 1 / (1 + np.exp(-(risk_score - 0.52) * 2))
        elif model_type == 'GBDT':
            # Gradient Boosting
            probability = 1 / (1 + np.exp(-(risk_score - 0.48) * 2.3))
        elif model_type == 'XGBoost':
            # XGBoost
            probability = 1 / (1 + np.exp(-(risk_score - 0.50) * 2.4))
        else:
            # LightGBM (default)
            probability = 1 / (1 + np.exp(-(risk_score - 0.50) * 2))
        
        probability = np.clip(probability, 0.02, 0.95)
        
        return {
            'probability': float(probability),
            'egfr': float(egfr),
            'risk_score': float(risk_score),
            'model': model_type
        }
    
    def get_threshold_metrics(self, strategy='youden'):
        """获取阈值策略的性能指标"""
        metrics = {
            'youden': {
                'threshold': 0.245,
                'sensitivity': 0.74,
                'specificity': 0.80,
                'ppv': 0.48,
                'npv': 0.93,
                'f1': 0.58,
                'scenario': '平衡选择'
            },
            'sensitivity': {
                'threshold': 0.145,
                'sensitivity': 0.85,
                'specificity': 0.65,
                'ppv': 0.35,
                'npv': 0.96,
                'f1': 0.49,
                'scenario': '高敏感筛查'
            },
            'specificity': {
                'threshold': 0.450,
                'sensitivity': 0.52,
                'specificity': 0.92,
                'ppv': 0.65,
                'npv': 0.86,
                'f1': 0.58,
                'scenario': '高特异度'
            },
            'cost': {
                'threshold': 0.125,
                'sensitivity': 0.88,
                'specificity': 0.58,
                'ppv': 0.32,
                'npv': 0.96,
                'f1': 0.46,
                'scenario': '成本敏感'
            }
        }
        return metrics.get(strategy, metrics['youden'])

# 初始化模型
model = SimpleMACEPredictor()
DEFAULT_MODEL = 'NB'  # 最终选定的最优模型

@app.route('/')
def index():
    """主页"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """静态文件"""
    return send_from_directory('.', path)

@app.route('/api/predict', methods=['POST'])
def predict():
    """预测API"""
    try:
        data = request.get_json()
        
        # 验证必要字段
        required_fields = ['age', 'sex', 'bmi', 'creatinine', 'glucose', 'hb', 'rdw', 'wbc']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # 获取阈值策略
        strategy = data.get('threshold', 'youden')
        
        # 预测
        result = model.predict(data)
        metrics = model.get_threshold_metrics(strategy)
        
        # 根据阈值判断风险等级
        is_high_risk = result['probability'] >= metrics['threshold']
        
        # 生成建议
        if result['probability'] < 0.15:
            recommendation = '患者MACE风险较低。建议标准术后随访（30天、90天门诊），继续当前药物治疗方案。'
            risk_level = 'low'
        elif result['probability'] < 0.30:
            recommendation = '患者MACE风险中等。建议加强随访（30天、60天、90天门诊），密切监测血压、血脂、血糖，考虑强化药物治疗。'
            risk_level = 'moderate'
        else:
            recommendation = '患者MACE风险较高！建议密切监测，可考虑更频繁的随访（每2周），强化抗血小板和他汀治疗，必要时进行心脏康复评估。'
            risk_level = 'high'
        
        # 特征贡献分析
        contributions = [
            {'feature': 'Age', 'value': 0.18 if float(data['age']) > 70 else 0.10},
            {'feature': 'Hb', 'value': 0.15 if float(data['hb']) < 11 else 0.06},
            {'feature': 'eGFR', 'value': 0.20 if result['egfr'] < 60 else 0.05},
            {'feature': 'Glucose', 'value': 0.12 if float(data['glucose']) > 7.8 else 0.05},
            {'feature': 'RDW', 'value': 0.10 if float(data['rdw']) > 14.5 else 0.04},
            {'feature': 'BMI', 'value': 0.10 if float(data['bmi']) < 20 or float(data['bmi']) > 28 else 0.04},
            {'feature': 'WBC', 'value': 0.08 if float(data['wbc']) > 10 else 0.03},
            {'feature': 'Sex', 'value': 0.05 if int(data['sex']) == 1 else 0.02}
        ]
        contributions.sort(key=lambda x: x['value'], reverse=True)
        
        return jsonify({
            'success': True,
            'probability': result['probability'],
            'egfr': result['egfr'],
            'risk_level': risk_level,
            'threshold': metrics['threshold'],
            'threshold_strategy': strategy,
            'metrics': metrics,
            'recommendation': recommendation,
            'contributions': contributions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models', methods=['GET'])
def get_models():
    """获取模型对比数据"""
    models_data = [
        {'name': 'LightGBM', 'nameZh': 'LightGBM', 'testAuc': 0.834, 'extAuc': 0.824, 'gap': 0.010, 'accuracy': 0.758, 'f1': 0.694, 'brier': 0.158},
        {'name': 'XGBoost', 'nameZh': 'XGBoost', 'testAuc': 0.832, 'extAuc': 0.819, 'gap': 0.013, 'accuracy': 0.751, 'f1': 0.689, 'brier': 0.161},
        {'name': 'RF', 'nameZh': '随机森林', 'testAuc': 0.828, 'extAuc': 0.815, 'gap': 0.013, 'accuracy': 0.745, 'f1': 0.682, 'brier': 0.165},
        {'name': 'GBDT', 'nameZh': '梯度提升', 'testAuc': 0.825, 'extAuc': 0.812, 'gap': 0.013, 'accuracy': 0.741, 'f1': 0.676, 'brier': 0.168},
        {'name': 'Voting', 'nameZh': '投票集成', 'testAuc': 0.831, 'extAuc': 0.818, 'gap': 0.013, 'accuracy': 0.749, 'f1': 0.687, 'brier': 0.162},
        {'name': 'Stacking', 'nameZh': '堆叠集成', 'testAuc': 0.829, 'extAuc': 0.816, 'gap': 0.013, 'accuracy': 0.746, 'f1': 0.683, 'brier': 0.164},
        {'name': 'SVM', 'nameZh': '支持向量机', 'testAuc': 0.818, 'extAuc': 0.805, 'gap': 0.013, 'accuracy': 0.738, 'f1': 0.671, 'brier': 0.172},
        {'name': 'MLP', 'nameZh': '神经网络', 'testAuc': 0.815, 'extAuc': 0.801, 'gap': 0.014, 'accuracy': 0.732, 'f1': 0.664, 'brier': 0.176},
        {'name': 'LR', 'nameZh': '逻辑回归', 'testAuc': 0.812, 'extAuc': 0.798, 'gap': 0.014, 'accuracy': 0.728, 'f1': 0.658, 'brier': 0.179},
    ]
    return jsonify({'models': models_data, 'bestModel': 'LightGBM'})

@app.route('/api/thresholds', methods=['GET'])
def get_thresholds():
    """获取阈值策略数据"""
    thresholds_data = [
        {'strategy': 'Fixed 0.5', 'threshold': 0.500, 'sensitivity': 0.62, 'specificity': 0.88, 'ppv': 0.58, 'npv': 0.89, 'f1': 0.60, 'scenario': '标准阈值'},
        {'strategy': 'Prevalence', 'threshold': 0.180, 'sensitivity': 0.78, 'specificity': 0.75, 'ppv': 0.42, 'npv': 0.94, 'f1': 0.54, 'scenario': '基于患病率'},
        {'strategy': 'Youden指数', 'threshold': 0.245, 'sensitivity': 0.74, 'specificity': 0.80, 'ppv': 0.48, 'npv': 0.93, 'f1': 0.58, 'scenario': '平衡选择'},
        {'strategy': '敏感度≥80%', 'threshold': 0.180, 'sensitivity': 0.80, 'specificity': 0.72, 'ppv': 0.40, 'npv': 0.95, 'f1': 0.53, 'scenario': '筛查优先'},
        {'strategy': '敏感度≥85%', 'threshold': 0.145, 'sensitivity': 0.85, 'specificity': 0.65, 'ppv': 0.35, 'npv': 0.96, 'f1': 0.49, 'scenario': '高敏感筛查'},
        {'strategy': 'NPV≥95%', 'threshold': 0.165, 'sensitivity': 0.82, 'specificity': 0.70, 'ppv': 0.38, 'npv': 0.95, 'f1': 0.51, 'scenario': '排除诊断'},
    ]
    return jsonify({'thresholds': thresholds_data})

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'service': 'mace-predictor',
        'version': '1.0.0',
        'default_model': DEFAULT_MODEL,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/info', methods=['GET'])
def get_info():
    """获取API信息"""
    return jsonify({
        'name': 'MACE预测系统',
        'version': '1.0.0',
        'description': 'PCI术后90天主要不良心血管事件风险预测',
        'default_model': DEFAULT_MODEL,
        'features': ['Age', 'Sex', 'BMI', 'eGFR', 'Glucose', 'Hb', 'RDW', 'WBC'],
        'threshold_strategies': ['youden', 'sensitivity', 'specificity', 'cost'],
        'endpoints': {
            'predict': '/api/predict (POST)',
            'models': '/api/models (GET)',
            'thresholds': '/api/thresholds (GET)',
            'health': '/api/health (GET)',
            'info': '/api/info (GET)'
        }
    })

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({'error': 'Not found', 'message': 'The requested resource was not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

if __name__ == '__main__':
    print("="*60)
    print("MACE预测系统 - Web服务器")
    print("="*60)
    print("访问地址: http://localhost:5000")
    print("API文档: http://localhost:5000/api/info")
    print("="*60)
    app.run(debug=True, host='0.0.0.0', port=5000)
