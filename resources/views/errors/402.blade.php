@extends('errors::branded')

@section('title', __('Payment Required'))
@section('code', '402')
@section('message', __('Payment is required to access this resource.'))
@section('description', 'This feature requires an active subscription or payment. Please upgrade your account or complete the payment to continue.')