<?php
class BMGroup_CloudwalkersClient_Controllers_Home
	extends BMGroup_CloudwalkersClient_Controllers_Base
{
	public function getContent ()
	{
		$client = BMGroup_CloudwalkersClient_Client::getInstance ();

		if (!$client->isLogin ())
		{
			echo '<html>';
			echo '<head><style type="text/css">body { background: #444; color: #444; }</style></head>';
			echo '<body>';
			echo '<p>Please login.</p>' . Neuron_URLBuilder::getUrl ('login');
			//$client->logout (Neuron_URLBuilder::getURL('login'));
			echo '<script type="text/javascript">document.location=\'' . Neuron_URLBuilder::getUrl ('login') . '\';</script>';
			echo '</body></html>';

			exit;
		}

		//$_SESSION['account'] = null;

		//var_dump ($client->post ('user/me/subscriptions', array (), array ('callback_url' => 'bla')));
		//exit;

		return '<p>No content.</p>';

		/*
		$page = new Neuron_Core_Template ();
		$page->set ('user', $userdata);

		return $page->parse ('modules/cloudwalkersclient/pages/home/home.phpt');
		*/
	}
	
	public function dispatch (Neuron_Page $page)
	{
		$GLOBALS['header-nav-active'] = 'home';
		$page->setContent ($this->getContent ());
		echo $page->getOutput ();
	}
}