import React, { useState } from 'react';
import { Form, Input, Button, Typography, Space, message, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title } = Typography;

interface ForgetPasswordFormData {
  email: string;
}

const ForgetPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const onFinish = async (values: ForgetPasswordFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await authAPI.forgetPassword(values.email);
      
      if (response.success) {
        setResetEmail(values.email);
        setIsModalVisible(true);
        form.resetFields();
      } else {
        message.error(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setResetEmail('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Top right navigation */}
      <div className="absolute top-6 right-6">
        <Space size={16}>
          <Link 
            to="/login"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/help"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Help
          </Link>
        </Space>
      </div>

      {/* Main content */}
      <div className="w-full max-w-sm mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <Title 
            level={1} 
            className="text-4xl font-normal text-gray-900 mb-0"
            style={{ fontWeight: 400, fontSize: '2.5rem', marginBottom: 0 }}
          >
            MOYI Referral
          </Title>
        </div>

        {/* Forget Password Form */}
        <Form
          form={form}
          name="forgetPassword"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          className="space-y-6"
        >
          {/* Email Field */}
          <Form.Item
            name="email"
            label={
              <span className="text-sm text-gray-700 font-normal">
                Email:
              </span>
            }
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
            className="mb-8"
          >
            <Input
              placeholder=""
              className="h-12 border-gray-300 rounded-none border-2 focus:border-gray-400 hover:border-gray-400"
              style={{
                borderRadius: 0,
                boxShadow: 'none',
              }}
            />
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              type="default"
              htmlType="submit"
              loading={isSubmitting}
              className="h-12 px-8 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              style={{
                borderRadius: 0,
                fontWeight: 'normal',
              }}
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </Button>
            
            <Link to="/login">
              <Button
                type="default"
                className="h-12 px-8 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                style={{
                  borderRadius: 0,
                  fontWeight: 'normal',
                }}
              >
                Cancel
              </Button>
            </Link>
          </div>
        </Form>

        {/* Success Modal */}
        <Modal
          title="Reset Email Sent"
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button 
              key="close" 
              type="default"
              onClick={handleModalClose}
              className="h-10 px-6 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50"
              style={{ borderRadius: 0 }}
            >
              Close
            </Button>
          ]}
          centered
        >
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              A password reset link has been sent to your email address.
            </p>
            <p className="font-medium text-gray-900 mb-4">
              {resetEmail}
            </p>
            <p className="text-gray-600 text-sm">
              Please check your email and click the link to reset your password.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ForgetPassword;